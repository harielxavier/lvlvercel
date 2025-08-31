// Add this route near the end of registerRoutes function, before the final httpServer creation

  // Subscription tier information endpoint
  app.get("/api/subscription/tier-info", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser || !currentUser.tenantId) {
        return res.status(404).json({ message: "User or tenant not found" });
      }

      const tenant = await storage.getTenant(currentUser.tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Import the tier info function
      const { getTierInfo } = await import('./subscriptionFeatures');
      const tierInfo = getTierInfo(tenant.subscriptionTier);
      
      res.json(tierInfo);
    } catch (error) {
      console.error("Error fetching tier info:", error);
      res.status(500).json({ message: "Failed to fetch subscription tier information" });
    }
  });

  const httpServer = createServer(app);