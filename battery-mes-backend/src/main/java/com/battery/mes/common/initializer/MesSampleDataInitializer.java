package com.battery.mes.common.initializer;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.sample-data.enabled", havingValue = "true")
public class MesSampleDataInitializer {
}
