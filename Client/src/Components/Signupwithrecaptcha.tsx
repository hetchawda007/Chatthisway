import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import Signup from "../pages/Signup"
const Signupwithrecaptcha = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
      <Signup />
    </GoogleReCaptchaProvider>
  )
}

export default Signupwithrecaptcha
