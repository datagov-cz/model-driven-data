import {BikeshedGenerator} from "../bikeshed";
import {JsonSchemaGenerator} from "../json-schema/json-schema-generator";
import {XmlSchemaGenerator} from "../xml-schema";
import {XsltLiftingGenerator, XsltLoweringGenerator} from "../xml-transformations";
import {CsvSchemaGenerator} from "../csv-schema/csv-schema-generator";
import {PlantUmlGenerator} from "../plant-uml";
import {SparqlGenerator} from "../sparql-query";
import {JsonLdGenerator} from "../json-ld/json-ld-generator";

/**
 * Use this to get artefact generators from this repository.
 */
export function createDefaultArtefactGenerators() {
  return [
    new BikeshedGenerator(),
    new JsonLdGenerator(),
    new JsonSchemaGenerator(),
    new XmlSchemaGenerator(),
    new XsltLoweringGenerator(),
    new XsltLiftingGenerator(),
    new CsvSchemaGenerator(),
    new PlantUmlGenerator(),
    new SparqlGenerator(),
  ];
}
