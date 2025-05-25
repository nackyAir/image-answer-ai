import { ApiKeySettings } from '~/components/settings/api-key-settings';
import { TokenUsageSettings } from '~/components/settings/token-usage-settings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="font-bold text-3xl">設定</h1>
          <p className="mt-2 text-muted-foreground">
            アカウントとアプリケーションの設定を管理します
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-semibold text-xl">API設定</h2>
            <ApiKeySettings />
          </section>

          <section>
            <h2 className="mb-4 font-semibold text-xl">使用量</h2>
            <TokenUsageSettings />
          </section>
        </div>
      </div>
    </div>
  );
}
