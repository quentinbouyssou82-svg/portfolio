import { LoginForm } from "@/components/control-tower/login-form";
import {
  getControlTowerConfigStatus,
  isControlTowerConfigured,
  logControlTowerConfigInDev,
} from "@/lib/control-tower/env";

export default function ControlTowerLoginPage() {
  logControlTowerConfigInDev();
  const configStatus = getControlTowerConfigStatus();
  return (
    <div className="ct-login-page">
      <div className="ct-login-card">
        <div className="ct-card" style={{ padding: "1.5rem" }}>
          <p className="ct-logo" style={{ marginBottom: "0.5rem" }}>
            <strong>Control Tower</strong>
          </p>
          <h1 className="ct-login-title">Accès privé</h1>
          <p className="ct-login-subtitle">
            Saisis ton PIN — connexion instantanée, sans email.
          </p>
          <LoginForm
            configured={isControlTowerConfigured()}
            missingVars={configStatus.missing}
          />
        </div>
      </div>
    </div>
  );
}
