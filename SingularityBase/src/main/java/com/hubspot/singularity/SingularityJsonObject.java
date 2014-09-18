package com.hubspot.singularity;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.guava.GuavaModule;
import com.google.common.base.Optional;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.hubspot.jackson.datatype.protobuf.ProtobufModule;

public class SingularityJsonObject {

  private static final ObjectMapper TO_STRING_OBJECT_MAPPER = new ObjectMapper()
    .setSerializationInclusion(Include.NON_NULL)
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    .registerModule(new GuavaModule())
    .registerModule(new ProtobufModule());

  @JsonIgnore
  public byte[] getAsBytes(ObjectMapper objectMapper) throws SingularityJsonException {
    try {
      return objectMapper.writeValueAsBytes(this);
    } catch (JsonProcessingException jpe) {
      throw new SingularityJsonException(jpe);
    }
  }

  @SuppressWarnings("serial")
  public static class SingularityJsonException extends RuntimeException {

    public SingularityJsonException(Throwable cause) {
      super(cause);
    }

  }

  public <T> Optional<List<T>> copyOfList(Optional<List<T>> list) {
    return list.isPresent() ? Optional.<List<T>> of(Lists.newArrayList(list.get())) : list;
  }

  public <K, V> Optional<Map<K, V>> copyOfMap(Optional<Map<K, V>> map) {
    return map.isPresent() ? Optional.<Map<K, V>> of(Maps.newHashMap(map.get())) : map;
  }

  @Override
  public String toString() {
    try {
      return TO_STRING_OBJECT_MAPPER.writeValueAsString(this);
    } catch (JsonProcessingException e) {
      throw Throwables.propagate(e);
    }
  }

}
