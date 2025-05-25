import { type NextRequest, NextResponse } from 'next/server';
import type { ChatCompletion } from 'openai/resources/chat/completions';
import { apiKeyManager } from '~/lib/api-key-manager';
import { auth } from '~/lib/auth';

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export async function POST(req: NextRequest) {
  try {
    console.log('PDF解析API開始');

    // ユーザー認証チェック
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      console.error('認証されていないリクエスト');
      return NextResponse.json(
        {
          error: '認証が必要です。ログインしてください。',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`ユーザー ${userId} がPDF解析をリクエスト`);

    // ユーザーのAPIキーを取得
    const apiKey = await apiKeyManager.getApiKey(userId);

    if (!apiKey) {
      console.error('使用可能なAPIキーがありません');
      return NextResponse.json(
        {
          error:
            'OpenAI APIキーが設定されていません。設定ページでAPIキーを設定するか、管理者にお問い合わせください。',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    // OpenAIのインポートを動的に行う
    let OpenAI: typeof import('openai').OpenAI;
    try {
      const openaiModule = await import('openai');
      OpenAI = openaiModule.OpenAI;
      console.log('OpenAIモジュールのインポート成功');
    } catch (error) {
      console.error('OpenAIモジュールのインポートエラー:', error);
      return NextResponse.json(
        {
          error: 'OpenAIライブラリの読み込みに失敗しました',
          code: 'OPENAI_IMPORT_ERROR',
        },
        { status: 500 }
      );
    }

    // pdf-parseのインポートを動的に行う
    let pdf: (buffer: Buffer) => Promise<{ text: string }>;
    try {
      pdf = (await import('pdf-parse')).default;
      console.log('pdf-parseモジュールのインポート成功');
    } catch (error) {
      console.error('pdf-parseモジュールのインポートエラー:', error);
      return NextResponse.json(
        {
          error: 'PDFパーサーライブラリの読み込みに失敗しました',
          code: 'PDF_PARSE_IMPORT_ERROR',
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const formData = await req.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      console.error('PDFファイルが提供されていません');
      return NextResponse.json(
        {
          error: 'PDFファイルが必要です',
          code: 'MISSING_FILE',
        },
        { status: 400 }
      );
    }

    console.log(`PDFファイル受信: ${file.name}, サイズ: ${file.size}bytes`);

    // PDFを解析
    const buffer = await file.arrayBuffer();
    console.log('ファイルをバッファに変換完了');

    let data: { text: string };
    try {
      data = await pdf(Buffer.from(buffer));
      console.log(`PDF解析完了: ${data.text.length}文字のテキストを抽出`);
    } catch (error) {
      console.error('PDF解析エラー:', error);
      return NextResponse.json(
        {
          error:
            'PDFファイルの解析に失敗しました。ファイルが破損している可能性があります。',
          code: 'PDF_PARSE_ERROR',
        },
        { status: 400 }
      );
    }

    const text = data.text;

    if (!text.trim()) {
      console.error('PDFからテキストが抽出されませんでした');
      return NextResponse.json(
        {
          error:
            'PDFからテキストを抽出できませんでした。画像のみのPDFの可能性があります。',
          code: 'NO_TEXT_EXTRACTED',
        },
        { status: 400 }
      );
    }

    console.log('OpenAI APIリクエスト開始');

    // OpenAIでPDFの内容を要約・構造化
    let completion: ChatCompletion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'あなたは教育資料分析の専門家です。提供されたPDFの内容を分析し、主要な概念、定理、公式、重要な情報を構造化して整理してください。後でこの情報を使って問題に回答するため、詳細で正確な要約を作成してください。',
          },
          {
            role: 'user',
            content: `以下のPDFの内容を分析してください：\n\n${text.substring(0, 10000)}`, // テキストサイズを制限
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });
      console.log('OpenAI APIリクエスト完了');
    } catch (error) {
      console.error('OpenAI APIエラー:', error);
      return NextResponse.json(
        {
          error:
            'OpenAI APIでの分析中にエラーが発生しました。APIキーや通信状況を確認してください。',
          code: 'OPENAI_API_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    const analysis = completion.choices[0]?.message?.content;

    // API使用量をログに記録
    if (completion.usage) {
      const cost = calculateCost(completion.usage, 'gpt-4o');
      await apiKeyManager.logUsage(userId, {
        promptTokens: completion.usage.prompt_tokens || 0,
        completionTokens: completion.usage.completion_tokens || 0,
        totalTokens: completion.usage.total_tokens || 0,
        cost: cost,
        apiEndpoint: '/api/analyze-pdf',
        requestType: 'pdf_analysis',
      });

      console.log(
        `API使用量記録: ${completion.usage.total_tokens} tokens, コスト: $${cost.toFixed(4)}`
      );
    }

    console.log('PDF解析処理完了');

    return NextResponse.json({
      success: true,
      originalText: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''), // レスポンスサイズを制限
      analysis: analysis,
      wordCount: text.split(' ').length,
      usage: completion.usage, // トークン使用量を追加
      userId: userId, // デバッグ用（本番では削除可能）
    });
  } catch (error) {
    console.error('予期しないエラー:', error);
    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました',
        code: 'UNEXPECTED_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OpenAI API使用料金計算関数
function calculateCost(usage: OpenAIUsage, model: string): number {
  const pricing = {
    'gpt-4o': {
      input: 0.005 / 1000, // $0.005 per 1K input tokens
      output: 0.015 / 1000, // $0.015 per 1K output tokens
    },
    'gpt-4': {
      input: 0.03 / 1000, // $0.03 per 1K input tokens
      output: 0.06 / 1000, // $0.06 per 1K output tokens
    },
    'gpt-3.5-turbo': {
      input: 0.001 / 1000, // $0.001 per 1K input tokens
      output: 0.002 / 1000, // $0.002 per 1K output tokens
    },
  };

  const modelPricing =
    pricing[model as keyof typeof pricing] || pricing['gpt-4o'];

  const inputCost = (usage.prompt_tokens || 0) * modelPricing.input;
  const outputCost = (usage.completion_tokens || 0) * modelPricing.output;

  return inputCost + outputCost;
}
