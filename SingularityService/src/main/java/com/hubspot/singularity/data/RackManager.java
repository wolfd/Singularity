package com.hubspot.singularity.data;

import org.apache.curator.framework.CuratorFramework;

import com.codahale.metrics.MetricRegistry;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hubspot.singularity.SingularityMachineStateHistoryUpdate;
import com.hubspot.singularity.SingularityRack;
import com.hubspot.singularity.config.SingularityConfiguration;
import com.hubspot.singularity.data.transcoders.Transcoder;

@Singleton
public class RackManager extends AbstractMachineManager<SingularityRack> {

  private static final String RACK_ROOT = "/racks";

  @Inject
  public RackManager(CuratorFramework curator, SingularityConfiguration configuration,  MetricRegistry metricRegistry,Transcoder<SingularityRack> rackTranscoder,
      Transcoder<SingularityMachineStateHistoryUpdate> stateHistoryTranscoder) {
    super(curator, configuration, metricRegistry, rackTranscoder, stateHistoryTranscoder);
  }

  @Override
  protected String getRoot() {
    return RACK_ROOT;
  }

}
