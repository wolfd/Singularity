package com.hubspot.singularity.schema;

import com.hubspot.singularity.MachineState;
import com.hubspot.singularity.SingularityRack;
import graphql.Scalars;
import graphql.relay.Relay;
import graphql.schema.*;

import static graphql.Scalars.GraphQLID;
import static graphql.Scalars.GraphQLInt;
import static graphql.schema.GraphQLFieldDefinition.newFieldDefinition;
import static graphql.schema.GraphQLObjectType.newObject;
import static graphql.schema.GraphQLSchema.newSchema;


public class SingularitySchema {
  private GraphQLSchema schema;

  private GraphQLObjectType rackType;

  private GraphQLInterfaceType nodeInterface;

  private Relay relay = new Relay();

  public SingularitySchema() {
    createSchema();
  }

  private void createSchema() {
    TypeResolverProxy typeResolverProxy = new TypeResolverProxy();
    nodeInterface = relay.nodeInterface(typeResolverProxy);
    
    createRackType();

    typeResolverProxy.setTypeResolver(object -> {
      if (object instanceof SingularityRack) {
        return rackType;
      } else if (object instanceof MachineState) {
        return null; //// FIXME: 7/17/16 this is bork
      }
      return null;
    });
  }

  private void createRackType() {
    rackType = newObject()
        .name("Rack")
        .field(newFieldDefinition()
          .name("rackId")
          .type(new GraphQLNonNull(GraphQLID))
          .dataFetcher(environment -> {
            SingularityRack rack = (SingularityRack) environment.getSource();
            return relay.toGlobalId("Rack", rack.getId());
          })
          .build())
        .field(newFieldDefinition()
          .name("name")
          .type(Scalars.GraphQLString)
          .build())
        .withInterface(nodeInterface)
        .build();
  }

  public GraphQLSchema getSchema() {
    return schema;
  }
}
