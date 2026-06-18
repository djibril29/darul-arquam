import { calculateBasmalaValue } from "@/lib/gematria";
import { WelcomeContent } from "@/components/welcome/welcome-content";

export default function WelcomePage() {
  const basmalaValue = calculateBasmalaValue().total;

  return <WelcomeContent basmalaValue={basmalaValue} />;
}
