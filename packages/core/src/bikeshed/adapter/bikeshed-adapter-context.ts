import {ArtefactGeneratorContext} from "../../generator";
import {LanguageString} from "../../core";
import {
  ConceptualModel,
  ConceptualModelClass,
  ConceptualModelProperty
} from "../../conceptual-model";
import {
  StructureModel,
  StructureModelClass,
  StructureModelProperty
} from "../../structure-model";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema
} from "../../data-specification/model";

/**
 * Context given to adapters.
 */
export class BikeshedAdapterContext {

  readonly generatorContext: ArtefactGeneratorContext;

  /**
   * In case of missing string a default value is returned.
   */
  selectString: (string: LanguageString | null) => string;

  selectOptionalString: (string: LanguageString | null) => string | null;

  sanitizeLink: (label: string) => string;

  conceptualClassAnchor:
    (conceptualModel: ConceptualModelClass) => string;

  conceptualPropertyAnchor:
    (conceptualClass: ConceptualModelClass,
     conceptualProperty: ConceptualModelProperty) => string;

  structuralClassAnchor:
    (format: string,
     structureModel: StructureModel,
     structureClass: StructureModelClass) => string;

  structuralPropertyAnchor:
    (format: string,
     structureModel: StructureModel,
     structureClass: StructureModelClass,
     structureProperty: StructureModelProperty) => string;

  /**
   * Artefact should be specified only if different from the
   * current artefact the content is generated for.
   */
  structuralClassLink:
    (format: string,
     structureModel: StructureModel,
     structureClass: StructureModelClass,
     artefact: DataSpecificationSchema | null) => string;

}

/**
 * Extension of context given to other generators, so they can include
 * the artefact into the documentation.
 */
export class BikeshedAdapterArtefactContext extends BikeshedAdapterContext {

  /**
   * Owner specification for an artefact to include.
   */
  readonly specification: DataSpecification;

  /**
   * Artefact to include by the generator.
   */
  readonly artefact: DataSpecificationArtefact;

  /**
   * Current conceptual model.
   */
  readonly conceptualModel: ConceptualModel;

  /**
   * Non-transformed structural model for given artefact.
   */
  readonly structureModel: StructureModel;

}
