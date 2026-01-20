const html = `
<html>
    <body style="font-family:'Montserrat',sans-serif;margin: 0;">

        <div style="max-width: 650px;margin: 0 auto">

            <div style="background-color: #000; color: #fafafa;padding: 15px 0;">
                <h1 style="line-height: 160%; text-align: center; font-size: 1.8em; font-weight: 400;">
                    <strong>QUESTIONS EDITOR</strong>
                </h1>
            </div>

            <h1 style="text-align: center; word-wrap: break-word; font-size: 33px; font-weight: 400;">
                <strong>Welcome to your questions editor.</strong>
            </h1>

            <div style="font-size: 14px; color: #444444; line-height: 170%; text-align: center;">
                <p style="font-size: 14px; line-height: 170%;">
                    <span style="font-size: 16px; line-height: 27.2px;">
                        Use this unique link to log in once.
                    </span>
                </p>
            </div>

            <div align="center" style="margin: 1em auto">
                <a href="[Url]"
                    style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #dc2626; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word;font-size: 14px;">
                    <span style="display:block;padding:14px 33px;line-height:120%;">
                        <strong>
                            <span style="font-size: 16px; line-height: 19.2px;">Click Here &rarr;</span>
                        </strong>
                    </span>
                </a>
            </div>

            <div style="background-color: #000; color: #fafafa;padding: 30px 0;">
                <div style="text-align: center;font-size: 0.8rem;">© 2024 Questions Editor</div>
            </div>
        </div>
    </body>
</html>
`

export async function sendVerificationAuthToken(email: string, url: string) {
  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      to: [email],
      from: process.env.NO_REPLY,
      subject: 'Sign in link - Questions editor',
      html: html.replace('[Url]', url),
    }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    const { errors } = await response.json()
    throw new Error(JSON.stringify(errors))
  }
}
