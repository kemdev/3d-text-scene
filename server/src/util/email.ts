import mailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const htmlBuilder = (template: any, token: any) => {
  const URL = process.env.PRODUCTION
    ? process.env.URL_PRODUCTION
    : process.env.URL_DEV;

  switch (template) {
    case 'welcome':
      return `
      
          <div
            style="
              width: 100%;
              display: flex;
              justify-content: center;
              flex-direction: column;
              align-items: center;
            "
          >
            <img src="http://localhost:5000/logo.jpg" alt="logo" />
            <div
              style="
                background-image: url("logo.jpg");
                height: 400px;
                width: 700px;
                background-repeat: no-repeat;
                background-size: cover;
                background-position: center;
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
              "
            >
              <h1
                style="
                  color: rgb(199, 199, 199);
                  font-size: 60px;
                  font-weight: bolder;
                  font-family: sans-serif;
                "
              >
                Time to get
                <span style="font-style: italic; color: rgb(206, 35, 35)"
                  >Creative!</span
                >
              </h1>
            </div>
            <h4>Hi Name,</h4>
            <p>
              If you didn't know that the sky has no limit, your'e about to find out! :)
            </p>
            <p>
              To start exploring the SeatToSky app please confirm your email address
            </p>
            <a  href="${URL}/emailconfirm/${token}"
              ><button
                style="
                  background-color: tomato;
                  border-radius: 20px;
                  border: none;
                  width: 120px;
                  height: 30px;
                  color: whitesmoke;
                "
              >
                Verify Now
              </button>
              
           
              </a
            >
            <p>
              Warmest welcome from
              <span style="font-style: italic">Sea To Sky team!</span>
            </p>
          </div>
       
            `;
    case 'forgotPass':
      return `
     
        <div
          style="
            width: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
          "
        >
          <div
            style="
              background-image: url("logo.jpg");
              height: 400px;
              width: 700px;
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center;
              display: flex;
              justify-content: center;
              flex-direction: column;
              align-items: center;
            "
          >
            <h1
              style="
                color: rgb(199, 199, 199);
                font-size: 60px;
                font-weight: bolder;
                font-family: sans-serif;
              "
            >
              Time to get
              <span style="font-style: italic; color: rgb(206, 35, 35)"
                >Creative!</span
              >
            </h1>
          </div>
          <h4>Hi there,</h4>
          <img src="cid:logo" alt="logo" />
          <p>Forgot your pass?</p>
          <p>Kindly click the following link to change your password</p>
          <a href="${URL}/changepassword/${token}"
            ><button
              style="
                background-color: tomato;
                border-radius: 20px;
                border: none;
                width: 120px;
                height: 30px;
                color: whitesmoke;
              "
            >
              Reset Password
            </button>
          </a>
          <p>
            <span style="font-style: italic">Sea To Sky team!</span>
          </p>
        </div>
      
      
            `;
  }
};

function mailerConfig(to: any, link: any) {
  const smtpServer = process.env.SMTP_SERVER as string;
  const smtpPort = process.env.SMTP_PORT as unknown as number;
  console.log('process.env.SMTP_USER', process.env.SMTP_USER);
  console.log('process.env.SMTP_USER', process.env.SMTP_PASS);

  const smtpTransport = mailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const data = {
    to: 'kareem_kemo@live.com',
    from: 'kareemalarmnazi19900@gmail.com',
    subject: 'Test Email',
    html: `<h1>Hello World</h1><p>This is a test email</p><a href="${link}" >Verify your email</a>`,
  };

  smtpTransport.sendMail(data, function (err, response) {
    if (err) {
      console.log('Error => ', err);
    } else {
      console.log('Response =>', response);
    }
  });

  // 3. close connection
  smtpTransport.close();
}

function sendVerificationEmail(to: any, token: any, link: any) {
  mailerConfig(to, link);
}

export { sendVerificationEmail };
