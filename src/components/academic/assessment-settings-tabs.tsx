'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AssessmentSettingsTabsProps {
  settingsContent: ReactNode;
  academicRulesContent: ReactNode;
  defaultTab?: 'settings' | 'academic-rules';
}

export function AssessmentSettingsTabs({
  settingsContent,
  academicRulesContent,
  defaultTab = 'settings',
}: AssessmentSettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1">
        <TabsTrigger value="settings" className="text-xs sm:text-sm">
          Settings
        </TabsTrigger>
        <TabsTrigger value="academic-rules" className="text-xs sm:text-sm">
          Academic Rules
        </TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-0 space-y-3">
        {settingsContent}
      </TabsContent>
      <TabsContent value="academic-rules" className="mt-0">
        {academicRulesContent}
      </TabsContent>
    </Tabs>
  );
}
