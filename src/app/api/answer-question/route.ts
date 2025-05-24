import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const pdfAnalysis = formData.get('pdfAnalysis') as string
    
    if (!image || !pdfAnalysis) {
      return NextResponse.json({ 
        error: '画像ファイルとPDF解析結果の両方が必要です' 
      }, { status: 400 })
    }

    // 画像をbase64に変換
    const buffer = await image.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const mimeType = image.type

    // OpenAIで画像の問題を解析し、PDFの内容を元に回答
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたは教育問題解答の専門家です。以下のPDF分析結果を参考情報として使用し、提供された画像の問題に正確に回答してください。

PDF分析結果：
${pdfAnalysis}

回答の際は：
1. PDF分析結果の関連する情報を活用する
2. 段階的に解法を説明する
3. 数式や図が必要な場合は明確に示す
4. 最終的な答えを明確に提示する
5. 日本語で回答する`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像の問題を、提供されたPDF資料の内容を参考に解答してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    const answer = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      answer: answer,
      usage: completion.usage
    })

  } catch (error) {
    console.error('問題回答エラー:', error)
    return NextResponse.json(
      { error: '問題回答中にエラーが発生しました' }, 
      { status: 500 }
    )
  }
} 