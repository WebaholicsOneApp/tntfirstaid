'use client';

export interface PrecisionPayResult {
  success: boolean;
  precisionPayToken?: string;
  plaidData?: {
    public_token: string;
    accountId: string;
    precisionPayPlaidUserId: string;
  };
  error?: string;
}

interface OpenPortalOptions {
  merchantNonce: string;
  amountDollars: string;
  env: 'sandbox' | 'live';
  checkoutPortalUrl: string;
}

export function openPrecisionPayPortal(options: OpenPortalOptions): Promise<PrecisionPayResult> {
  return new Promise((resolve) => {
    const iframeUrl = `${options.checkoutPortalUrl}/checkout-login/${encodeURI(options.merchantNonce)}/amount/${encodeURI(options.amountDollars)}/env/${options.env}`;

    // Create overlay + iframe
    const overlay = document.createElement('div');
    overlay.id = 'pp-checkout-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:rgba(255,255,255,0.5);transition:0.3s;';

    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.title = 'PrecisionPay Checkout';
    iframe.style.cssText = 'position:fixed;top:0;left:0;border:0;width:100vw;height:100vh;';

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    function cleanup() {
      window.removeEventListener('message', handleMessage);
      overlay.remove();
    }

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== 'object' || !data.message) return;

      const msg = data.message as string;

      if (msg === 'PrecisionPay::success') {
        cleanup();
        if (data.precisionPayToken) {
          resolve({
            success: true,
            precisionPayToken: data.precisionPayToken,
          });
        } else if (data.plaidData) {
          resolve({
            success: true,
            plaidData: {
              public_token: data.plaidData.public_token,
              accountId: data.plaidData.accountId,
              precisionPayPlaidUserId: data.plaidData.precisionPayPlaidUserId,
            },
          });
        } else {
          resolve({ success: false, error: 'No payment data received' });
        }
      } else if (msg === 'PrecisionPay::failed') {
        cleanup();
        resolve({ success: false, error: data.error_message || 'Payment failed' });
      } else if (msg === 'PrecisionPay::canceled') {
        cleanup();
        resolve({ success: false, error: 'Payment was canceled' });
      }
    }

    window.addEventListener('message', handleMessage);
  });
}
