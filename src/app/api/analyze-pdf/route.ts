import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('PDF解析API開始')
    
    // OpenAI API キーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY環境変数が設定されていません')
      return NextResponse.json({ 
        error: 'OpenAI API keyが設定されていません。環境変数を確認してください。',
        code: 'MISSING_API_KEY'
      }, { status: 500 })
    }

    // OpenAIのインポートを動的に行う
    let OpenAI
    try {
      const openaiModule = await import('openai')
      OpenAI = openaiModule.OpenAI
      console.log('OpenAIモジュールのインポート成功')
    } catch (error) {
      console.error('OpenAIモジュールのインポートエラー:', error)
      return NextResponse.json({ 
        error: 'OpenAIライブラリの読み込みに失敗しました',
        code: 'OPENAI_IMPORT_ERROR'
      }, { status: 500 })
    }

    // pdf-parseのインポートを動的に行う
    let pdf
    try {
      pdf = (await import('pdf-parse')).default
      console.log('pdf-parseモジュールのインポート成功')
    } catch (error) {
      console.error('pdf-parseモジュールのインポートエラー:', error)
      return NextResponse.json({ 
        error: 'PDFパーサーライブラリの読み込みに失敗しました',
        code: 'PDF_PARSE_IMPORT_ERROR'
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const formData = await req.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      console.error('PDFファイルが提供されていません')
      return NextResponse.json({ 
        error: 'PDFファイルが必要です',
        code: 'MISSING_FILE'
      }, { status: 400 })
    }

    console.log(`PDFファイル受信: ${file.name}, サイズ: ${file.size}bytes`)

    // PDFを解析
    const buffer = await file.arrayBuffer()
    console.log('ファイルをバッファに変換完了')
    
    let data
    try {
      data = await pdf(Buffer.from(buffer))
      console.log(`PDF解析完了: ${data.text.length}文字のテキストを抽出`)
    } catch (error) {
      console.error('PDF解析エラー:', error)
      return NextResponse.json({ 
        error: 'PDFファイルの解析に失敗しました。ファイルが破損している可能性があります。',
        code: 'PDF_PARSE_ERROR'
      }, { status: 400 })
    }

    const text = data.text

    if (!text.trim()) {
      console.error('PDFからテキストが抽出されませんでした')
      return NextResponse.json({ 
        error: 'PDFからテキストを抽出できませんでした。画像のみのPDFの可能性があります。',
        code: 'NO_TEXT_EXTRACTED'
      }, { status: 400 })
    }

    console.log('OpenAI APIリクエスト開始')

    // OpenAIでPDFの内容を要約・構造化
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "あなたは教育資料分析の専門家です。提供されたPDFの内容を分析し、主要な概念、定理、公式、重要な情報を構造化して整理してください。後でこの情報を使って問題に回答するため、詳細で正確な要約を作成してください。"
          },
          {
            role: "user",
            content: `以下のPDFの内容を分析してください：\n\n${text.substring(0, 10000)}` // テキストサイズを制限
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      })
      console.log('OpenAI APIリクエスト完了')
    } catch (error) {
      console.error('OpenAI APIエラー:', error)
      return NextResponse.json({ 
        error: 'OpenAI APIでの分析中にエラーが発生しました。APIキーや通信状況を確認してください。',
        code: 'OPENAI_API_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    const analysis = completion.choices[0]?.message?.content

    console.log('PDF解析処理完了')

    return NextResponse.json({
      success: true,
      originalText: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''), // レスポンスサイズを制限
      analysis: analysis,
      wordCount: text.split(' ').length
    })

  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { 
        error: '予期しないエラーが発生しました',
        code: 'UNEXPECTED_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 