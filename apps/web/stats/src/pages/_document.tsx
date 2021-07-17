import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render(): JSX.Element {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="description" content="Brawlhalla Stats and Rankings" />
                    {/* <meta name="keywords" content="Keywords" /> */}

                    <link rel="manifest" href="/manifest.json" />
                    <link href="icons/favicon-192x192.png" rel="icon" type="image/png" sizes="192x192" />
                    <link href="icons/favicon-512x512.png" rel="icon" type="image/png" sizes="512x512" />
                    <link rel="apple-touch-icon" href="icons/icon-192x192.png" />
                    <meta name="theme-color" content="#317EFB" />

                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
