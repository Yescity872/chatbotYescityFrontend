export const initializeRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

interface PaymentOptions {
    premiumType: string; // 'A' for Gold, 'B' for Diamond
    amount: number;
    currency?: string;
    description?: string;
    userId?: string;
}

export const openRazorpayCheckout = async (options: PaymentOptions) => {
    try {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
            const razorpayLoaded = await initializeRazorpay();
            if (!razorpayLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }
        }

        // Call backend to create order and get order details
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/premium/create-order`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    premiumType: options.premiumType,
                    amount: options.amount,
                    currency: options.currency || 'INR',
                }),
            }
        );

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check content type and parse JSON safely
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Expected JSON response from server');
        }

        const text = await response.text();

        // Check if response body is empty
        if (!text) {
            throw new Error('Empty response from server');
        }

        let orderData;
        try {
            orderData = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response text:', text);
            throw new Error('Invalid JSON response from server');
        }

        if (!orderData.success) {
            throw new Error(orderData.message || 'Failed to create order');
        }

        const { orderId, amount, currency, key } = orderData;

        // Validate required fields
        if (!orderId || !amount) {
            throw new Error('Missing required order data from server');
        }

        // Open Razorpay checkout
        const razorpayOptions = {
            key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_05vRQUyM51wLYD',
            amount: amount,
            currency: currency || 'INR',
            name: 'YesCity',
            description: options.description || `Premium Plan ${options.premiumType}`,
            order_id: orderId,
            handler: async function (response: any) {
                // Payment successful, verify with backend
                try {
                    const verifyResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/premium/verify-payment`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                premiumType: options.premiumType,
                            }),
                        }
                    );

                    // Check if verification response is OK
                    if (!verifyResponse.ok) {
                        throw new Error(`HTTP error! status: ${verifyResponse.status}`);
                    }

                    const verifyContentType = verifyResponse.headers.get('content-type');
                    if (!verifyContentType || !verifyContentType.includes('application/json')) {
                        throw new Error('Expected JSON response from verification');
                    }

                    const verifyText = await verifyResponse.text();

                    if (!verifyText) {
                        throw new Error('Empty verification response');
                    }

                    let verifyData;
                    try {
                        verifyData = JSON.parse(verifyText);
                    } catch (parseError) {
                        console.error('Verification JSON parse error:', parseError);
                        throw new Error('Invalid verification response');
                    }

                    if (verifyData.success) {
                        // Show success message
                        alert(verifyData.message || '🎉 Payment successful! Premium activated.');

                        // Refresh page to update premium status
                        window.location.reload();

                        return {
                            success: true,
                            message: verifyData.message || 'Payment successful! Premium activated.',
                            data: verifyData,
                        };
                    } else {
                        const errorMessage = verifyData.message || 'Payment verification failed.';
                        alert(errorMessage);
                        return {
                            success: false,
                            message: errorMessage,
                        };
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Payment verification failed. Please contact support.';
                    alert(errorMessage);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },
            prefill: {
                name: 'User',
                email: '',
                contact: '',
            },
            theme: {
                color: '#1E88E5',
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment cancelled');
                    alert('Payment was cancelled. You can try again anytime.');
                },
            },
        };

        const razorpay = new window.Razorpay(razorpayOptions);

        razorpay.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response);
            alert(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        });

        razorpay.open();

        return razorpay;
    } catch (error) {
        console.error('Error opening Razorpay checkout:', error);

        // Provide user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
        alert(`Payment Error: ${errorMessage}`);

        throw error;
    }
};
