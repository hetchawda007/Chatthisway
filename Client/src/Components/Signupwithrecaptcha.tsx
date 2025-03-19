import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import Signup from "../pages/Signup"
import SEOHelmet from "./SEOHelmet"

const Signupwithrecaptcha = () => {
  return (
    <>
      <SEOHelmet
        title="Sign Up | ChatThisWay"
        description="Create a new account on ChatThisWay and enjoy secure, real-time messaging with end-to-end encryption."
        keywords="sign up, register, secure messaging, ChatThisWay, encrypted chat"
        ogTitle="Join ChatThisWay - Secure Messaging Platform"
        ogDescription="Create your account and start secure messaging with end-to-end encryption."
      />
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
        <Signup />
      </GoogleReCaptchaProvider>
    </>
  );
};

export default Signupwithrecaptcha;
