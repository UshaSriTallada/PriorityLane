import AuthForm from "@/firebase/auth/auth-form";
import AuthLayout from "../auth-layout";

export default function SignupPage() {
    return (
        <AuthLayout>
            <AuthForm mode="signup" />
        </AuthLayout>
    );
}
