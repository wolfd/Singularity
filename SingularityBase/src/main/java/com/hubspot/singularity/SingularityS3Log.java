package com.hubspot.singularity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SingularityS3Log extends SingularityJsonObject {

  private final String getUrl;
  private final String key;
  private final long lastModified;
  private final long size;

  @JsonCreator
  public SingularityS3Log(@JsonProperty("getUrl") String getUrl, @JsonProperty("key") String key, @JsonProperty("lastModified") long lastModified, @JsonProperty("size") long size) {
    this.getUrl = getUrl;
    this.key = key;
    this.lastModified = lastModified;
    this.size = size;
  }

  public String getGetUrl() {
    return getUrl;
  }

  public String getKey() {
    return key;
  }

  public long getLastModified() {
    return lastModified;
  }

  public long getSize() {
    return size;
  }

}
