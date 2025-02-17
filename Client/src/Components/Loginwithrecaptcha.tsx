import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Login from '../pages/Login';
const Loginwithrecaptcha = () => {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
            <Login />
        </GoogleReCaptchaProvider>
    )
}

export default Loginwithrecaptcha
