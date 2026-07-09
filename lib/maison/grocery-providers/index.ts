export {
  GROCERY_PROVIDERS,
  GROCERY_PROVIDER_LIST,
  getProviderStores,
  type GroceryProviderConfig,
  type GroceryProviderId,
} from "@/lib/maison/grocery-providers/config";
export {
  connectGroceryProvider,
  connectLeclerc,
  connectLeclercOAuth,
  getGroceryIntegration,
  getLeclercIntegration,
  isGroceryProviderConnected,
  isLeclercConnected,
  listLeclercStores,
  listStores,
  mockLeclercProductId,
  type GroceryConnectMode,
} from "@/lib/maison/grocery-providers/service";
export {
  buildGroceryOAuthAuthorizeUrl,
  confirmGroceryExternalLogin,
  handleGroceryOAuthCallback,
  GroceryOAuthError,
} from "@/lib/maison/grocery-providers/oauth";
export {
  getMaisonAppOrigin,
  getProviderOAuthEnv,
  isProviderOAuthConfigured,
  supportsProviderOAuthRedirect,
} from "@/lib/maison/grocery-providers/oauth-config";
export { getGroceryCredentials } from "@/lib/maison/grocery-providers/credentials";
