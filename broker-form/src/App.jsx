import BrokerForm from "./BrokerForm";
import CreditApp from "./CreditApp";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isCredit = params.has("invite") || params.get("app") === "credit";
  return isCredit ? <CreditApp /> : <BrokerForm />;
}
