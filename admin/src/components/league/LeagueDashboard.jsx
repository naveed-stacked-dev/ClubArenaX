import React from "react";
import { motion } from "framer-motion";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import LeaguePointsTable from "./LeaguePointsTable";
import LeagueNetworkGraph from "./LeagueNetworkGraph";
import LeagueFixtures from "./LeagueFixtures";
import LeagueTimeline from "./LeagueTimeline";

export default function LeagueDashboard({ activeTab, tournamentId, matches, teams, onRefresh }) {
  const loading = false; // Add actual loading state later

  return (
    <>
      <TabsContent value="league-points">
        <LeaguePointsTable matches={matches} teams={teams} />
      </TabsContent>

      <TabsContent value="league-network">
        <LeagueNetworkGraph matches={matches} teams={teams} />
      </TabsContent>

      <TabsContent value="league-fixtures">
        <LeagueFixtures matches={matches} />
      </TabsContent>

      <TabsContent value="league-timeline">
        <LeagueTimeline matches={matches} />
      </TabsContent>
    </>
  );
}
