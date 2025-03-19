import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Login from '../pages/Login';
import SEOHelmet from './SEOHelmet';

const Loginwithrecaptcha = () => {
    return (
        <>
            <SEOHelmet
                title="Login | ChatThisWay"
                description="Log in to your ChatThisWay account to access secure, end-to-end encrypted messaging."
                keywords="login, secure messaging, ChatThisWay, encrypted chat"
                ogTitle="Log in to ChatThisWay"
                ogDescription="Access your secure messaging account on ChatThisWay."
            />
            <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
                <Login />
            </GoogleReCaptchaProvider>
        </>
    );
};

export default Loginwithrecaptcha;
