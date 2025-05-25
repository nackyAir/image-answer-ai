import { type NextRequest, NextResponse } from 'next/server';
import type { ChatCompletion } from 'openai/resources/chat/completions';
import { apiKeyManager } from '~/lib/api-key-manager';
import { auth } from '~/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('画像問題回答API開始');

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
    console.log(`ユーザー ${userId} が画像問題回答をリクエスト`);

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

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const formData = await req.formData();
    const image = formData.get('image') as File;
    const pdfAnalysis = formData.get('pdfAnalysis') as string;

    if (!image || !pdfAnalysis) {
      return NextResponse.json(
        {
          error: '画像ファイルとPDF解析結果の両方が必要です',
          code: 'MISSING_DATA',
        },
        { status: 400 }
      );
    }

    console.log(`画像ファイル受信: ${image.name}, サイズ: ${image.size}bytes`);

    // 画像をbase64に変換
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mimeType = image.type;

    console.log('OpenAI APIリクエスト開始（画像問題解析）');

    // OpenAIで画像の問題を解析し、PDFの内容を元に回答
    let completion: ChatCompletion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `あなたは教育問題解答の専門家です。以下のPDF分析結果を参考情報として使用し、提供された画像の問題に正確に回答してください。

PDF分析結果：
${pdfAnalysis}

回答の際は：
1. PDF分析結果の関連する情報を活用する
2. 段階的に解法を説明する
3. 数式や図が必要な場合は明確に示す
4. 最終的な答えを明確に提示する
5. 日本語で回答する`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'この画像の問題を、提供されたPDF資料の内容を参考に解答してください。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });
      console.log('OpenAI APIリクエスト完了（画像問題解析）');
    } catch (error) {
      console.error('OpenAI APIエラー:', error);
      return NextResponse.json(
        {
          error:
            'OpenAI APIでの画像解析中にエラーが発生しました。APIキーや通信状況を確認してください。',
          code: 'OPENAI_API_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    const answer = completion.choices[0]?.message?.content;

    // API使用量をログに記録
    if (completion.usage) {
      const cost = calculateCost(completion.usage, 'gpt-4o');
      await apiKeyManager.logUsage(userId, {
        promptTokens: completion.usage.prompt_tokens || 0,
        completionTokens: completion.usage.completion_tokens || 0,
        totalTokens: completion.usage.total_tokens || 0,
        cost: cost,
        apiEndpoint: '/api/answer-question',
        requestType: 'image_analysis',
      });

      console.log(
        `API使用量記録: ${completion.usage.total_tokens} tokens, コスト: $${cost.toFixed(4)}`
      );
    }

    console.log('画像問題回答処理完了');

    return NextResponse.json({
      success: true,
      answer: answer,
      usage: completion.usage,
      userId: userId, // デバッグ用（本番では削除可能）
    });
  } catch (error) {
    console.error('問題回答エラー:', error);
    return NextResponse.json(
      {
        error: '問題回答中にエラーが発生しました',
        code: 'UNEXPECTED_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OpenAI API使用料金計算関数
function calculateCost(
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  },
  model: string
): number {
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
