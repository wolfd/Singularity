package com.hubspot.singularity.s3.base.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hubspot.singularity.runner.base.jackson.Obfuscate;

import static com.hubspot.singularity.runner.base.jackson.ObfuscateAnnotationIntrospector.ObfuscateSerializer.obfuscateValue;

public class SingularityS3Credentials {
  private final String accessKey;
  private final String secretKey;

  @JsonCreator
  public SingularityS3Credentials(@JsonProperty("accessKey") String accessKey, @JsonProperty("secretKey") String secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  @Obfuscate
  public String getAccessKey() {
    return accessKey;
  }

  @Obfuscate
  public String getSecretKey() {
    return secretKey;
  }

  @Override
  public String toString() {
    return "SingularityS3Credentials[" +
            "accessKey='" + obfuscateValue(accessKey) + '\'' +
            ", secretKey='" + obfuscateValue(secretKey) + '\'' +
            ']';
  }
}
