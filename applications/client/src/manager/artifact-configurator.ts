import {DataSpecificationArtefact, DataSpecificationDocumentation, DataSpecificationSchema} from "@dataspecer/core/data-specification/model";
import {PlantUmlGenerator} from "@dataspecer/plant-uml";
import {PlantUmlImageGenerator} from "./artifacts/plant-uml-image-generator";
import {BIKESHED} from "@dataspecer/bikeshed";
import {BikeshedHtmlGenerator} from "./artifacts/bikeshed-html-generator";
import {mergeConfigurations} from "@dataspecer/core/configuration/utils";
import { DefaultArtifactConfigurator } from "../default-artifact-configurator";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";

export class ArtifactConfigurator extends DefaultArtifactConfigurator {
  public async generateFor(
    dataSpecificationIri: string,
  ): Promise<DataSpecificationArtefact[]> {
    const artifacts = await super.generateFor(dataSpecificationIri);
    const currentSchemaArtefacts = artifacts
        .filter(artifact => DataSpecificationSchema.is(artifact))
        .map(artifact => artifact.iri as string);

    const dataSpecification = this.dataSpecifications.find(
        dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    const localConfiguration = dataSpecification.artefactConfiguration;
    const configuration = mergeConfigurations(this.configurators, this.configurationObject, localConfiguration);

    const dataSpecificationName = await this.getSpecificationDirectoryName(dataSpecificationIri);

    const dataSpecificationConfiguration = DataSpecificationConfigurator.getFromObject(configuration);

    // PlantUML source
    const plantUml = new DataSpecificationDocumentation();
    plantUml.iri = `${dataSpecificationIri}#plantUml`;
    plantUml.outputPath = `${dataSpecificationName}/conceptual-model.plantuml`;
    plantUml.publicUrl = `${this.baseURL}/conceptual-model.plantuml`;
    plantUml.generator = PlantUmlGenerator.IDENTIFIER;
    plantUml.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["plantUML"] !== false) {
      artifacts.push(plantUml);
    }

    // PlantUml image
    const plantUmlImage = new DataSpecificationDocumentation();
    plantUmlImage.iri = `${dataSpecificationIri}#plantUmlImage`;
    plantUmlImage.outputPath = `${dataSpecificationName}/conceptual-model.svg`;
    plantUmlImage.publicUrl = `${this.baseURL}/conceptual-model.svg`;
    plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;
    plantUmlImage.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["plantUML"] !== false) {
      artifacts.push(plantUmlImage);
    }


    // Bikeshed source
    const bikeshed = new DataSpecificationDocumentation();
    bikeshed.iri = `${dataSpecificationIri}#bikeshed`;
    bikeshed.outputPath = `${dataSpecificationName}/documentation.bs`;
    bikeshed.publicUrl = `${this.baseURL}/documentation.bs`;
    bikeshed.generator = BIKESHED.Generator;
    bikeshed.artefacts = currentSchemaArtefacts;
    bikeshed.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["bikeshed"] !== false) {
      artifacts.push(bikeshed);
    }

    // Bikeshed HTML
    const bikeshedHtml = new DataSpecificationDocumentation();
    bikeshedHtml.iri = `${dataSpecificationIri}#bikeshedHtml`;
    bikeshedHtml.outputPath = `${dataSpecificationName}/documentation.html`;
    bikeshedHtml.publicUrl = `${this.baseURL}/documentation.html`;
    bikeshedHtml.generator = BikeshedHtmlGenerator.IDENTIFIER;
    bikeshedHtml.artefacts = currentSchemaArtefacts;
    bikeshedHtml.configuration = configuration;
    if (dataSpecificationConfiguration.useGenerators?.["bikeshed"] !== false) {
      artifacts.push(bikeshedHtml);
    }

    return artifacts;
  }
}
