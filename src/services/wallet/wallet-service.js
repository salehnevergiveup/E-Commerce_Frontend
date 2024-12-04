import sendRequest from "@/services/requests/request-service"; // Adjust if needed
import RequestMethods from "@/enums/request-methods";

const WalletService = {
  async fetchBalance() {
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        "wallet/balance",
        null,
        true
      );
      console.log("wallet service return: " + response);
      return response;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  },

  async createTopUpSession(amount, currency = "MYR") {
    try {
      const response = await sendRequest(
        RequestMethods.POST,
        "wallet/top-up-session",
        { amount, currency },
        true
      );
      return response;
    } catch (error) {
      console.error("Error creating top-up session:", error);
      throw error;
    }
  },

  async navigateToTopUp(router) {
    try {
      router.push("/user/top-up-wallet");
    } catch (error) {
      console.error("Error navigating to top-up wallet page:", error);
      throw error;
    }
  },
};

export default WalletService;
