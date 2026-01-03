'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Shield, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Roadmap() {
  const { t } = useLanguage();

  const roadmapStages = [
    {
      version: '1.0',
      titleKey: 'roadmap.stage1.title',
      status: 'completed' as const,
      icon: Rocket,
      descKey: 'roadmap.stage1.desc',
      featuresKey: 'roadmap.stage1.features',
    },
    {
      version: '2.0',
      titleKey: 'roadmap.stage2.title',
      status: 'current' as const,
      icon: Shield,
      descKey: 'roadmap.stage2.desc',
      featuresKey: 'roadmap.stage2.features',
    },
    {
      version: '3.0',
      titleKey: 'roadmap.stage3.title',
      status: 'upcoming' as const,
      icon: Globe,
      descKey: 'roadmap.stage3.desc',
      featuresKey: 'roadmap.stage3.features',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            {t('roadmap.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            {t('roadmap.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {roadmapStages.map((stage, index) => {
            const Icon = stage.icon;
            const features = t(stage.featuresKey).split('|');

            return (
              <Card
                key={stage.version}
                className={`bg-card border-border/60 relative overflow-hidden ${
                  stage.status === 'current' ? 'border-primary/50 shadow-md' : ''
                }`}
              >
                {stage.status === 'current' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 neon-glow">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <Badge
                      variant={
                        stage.status === 'completed'
                          ? 'default'
                          : stage.status === 'current'
                            ? 'default'
                            : 'outline'
                      }
                    >
                      {t(`roadmap.status.${stage.status}`)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-4xl font-bold gradient-text">
                      {stage.version}
                    </div>
                    <CardTitle className="text-2xl">{t(stage.titleKey)}</CardTitle>
                  </div>

                  <CardDescription className="text-base">
                    {t(stage.descKey)}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-1">▸</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
