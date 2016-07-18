package com.hubspot.singularity.resources;

import com.hubspot.singularity.schema.SingularitySchema;
import com.wordnik.swagger.annotations.ApiOperation;
import graphql.ExecutionResult;
import graphql.GraphQL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.LinkedHashMap;
import java.util.Map;

@Path("/graphql")
public class GraphQlResource {
  private static final Logger log = LoggerFactory.getLogger(GraphQlResource.class);

  SingularitySchema singularitySchema = new SingularitySchema();
  GraphQL graphql = new GraphQL(singularitySchema.getSchema());


  @GET
  @ApiOperation("GraphQL endpoint for data")
  @Produces(MediaType.APPLICATION_JSON)
  public Object executeOperation(Map body) {
    String query = (String) body.get("query");
    Map<String, Object> variables = (Map<String, Object>) body.get("variables");

    ExecutionResult executionResult = graphql.execute(query, (Object) null, variables);

    Map<String, Object> result = new LinkedHashMap<>();
    if (executionResult.getErrors().size() > 0) {
      result.put("errors", executionResult.getErrors());
      log.error("Errors: {}", executionResult.getErrors());
    }

    result.put("data", executionResult.getData());
    return result;
  }
}
