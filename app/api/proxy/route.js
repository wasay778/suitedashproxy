import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Function to get target URL based on incoming request
const getTargetUrl = (url) => {
    // Adjust the logic to determine the target URL
    return `https://power.msbglobals.com${new URL(url).pathname}`;
};

// Function to get common headers for the forwarded request
const getCommonHeaders = (headersList, additionalHeaders = {}) => {
    const forwardHeaders = {};
    headersList.forEach((value, key) => {
        // Exclude certain headers that could cause issues
        if (!['host', 'content-length', 'x-frame-options', 'content-security-policy'].includes(key.toLowerCase())) {
            forwardHeaders[key] = value;
        }
    });
    return { ...forwardHeaders, ...additionalHeaders };
};

// Function to create response headers from the response object
const createResponseHeaders = (responseHeaders) => {
    const headersObj = {};
    responseHeaders.forEach((value, key) => {
        // Strip the 'X-Frame-Options' header
        if (!['x-frame-options', 'content-length'].includes(key.toLowerCase())) {
            headersObj[key] = value;
        }
    });
    return headersObj;
};

export async function POST(request) {
    try {
        const targetUrl = getTargetUrl(request.url);
        const headersList = headers();
        const contentType = headersList.get('content-type');

        // Handle different content types
        let formData;
        try {
            if (contentType?.includes('application/json')) {
                formData = await request.json();
            } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                formData = await request.formData();
            } else {
                formData = await request.text();
            }
        } catch (error) {
            console.error('Error parsing request body:', error);
            return new NextResponse(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
        }

        const forwardHeaders = getCommonHeaders(headersList, {
            'Content-Type': contentType || 'application/x-www-form-urlencoded',
            'Origin': 'https://power.msbglobals.com', // Update to just the domain
            'Referer': 'https://power.msbglobals.com'
        });

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: forwardHeaders,
            body: typeof formData === 'string' ? formData : JSON.stringify(formData),
            redirect: 'follow',
        });

        // Check for specific headers to determine if iframe embedding is allowed
        const xFrameOptions = response.headers.get('x-frame-options');
        const contentSecurityPolicy = response.headers.get('content-security-policy');
        const isRedirectOrBlocked = !response.ok || xFrameOptions || (contentSecurityPolicy && contentSecurityPolicy.includes('frame-ancestors'));

        if (isRedirectOrBlocked) {
            return NextResponse.redirect('https://power.msbglobals.com/dashboard');
        }

        let content;

        // Check for content encoding
        const encoding = response.headers.get('content-encoding');
        if (encoding === 'gzip') {
            // Handle gzip response
            const buffer = await response.arrayBuffer();
            content = new TextDecoder('utf-8').decode(buffer);
        } else {
            content = await response.text();
        }

        const responseHeaders = createResponseHeaders(response.headers);

        return new NextResponse(content, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse(
            JSON.stringify({ 
                error: 'Failed to process request', 
                details: error.message,
                url: request.url 
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
    }
}

export async function GET(request) {
    try {
        const targetUrl = getTargetUrl(request.url);
        const headersList = headers();
        const forwardHeaders = getCommonHeaders(headersList);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: forwardHeaders
        });

        // Check for specific headers to determine if iframe embedding is allowed
        const xFrameOptions = response.headers.get('x-frame-options');
        const contentSecurityPolicy = response.headers.get('content-security-policy');
        const isRedirectOrBlocked = !response.ok || xFrameOptions || (contentSecurityPolicy && contentSecurityPolicy.includes('frame-ancestors'));

        if (isRedirectOrBlocked) {
            return NextResponse.redirect('https://power.msbglobals.com/dashboard');
        }

        let content;

        // Check for content encoding
        const encoding = response.headers.get('content-encoding');
        if (encoding === 'gzip') {
            // Handle gzip response
            const buffer = await response.arrayBuffer();
            content = new TextDecoder('utf-8').decode(buffer);
        } else {
            content = await response.text();
        }

        const responseHeaders = createResponseHeaders(response.headers);

        return new NextResponse(content, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse(
            JSON.stringify({ 
                error: 'Failed to fetch content',
                details: error.message,
                url: request.url
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
    }
}
