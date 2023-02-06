import { BikeshedAdapterContext } from "./bikeshed-adapter-context";
import {
  ConceptualModel,
  ConceptualModelClass,
  ConceptualModelProperty,
} from "@dataspecer/core/conceptual-model";
import {
  BikeshedContent,
  BikeshedContentList,
  BikeshedContentText,
  BikeshedContentListItem,
  BikeshedContentSection,
} from "../bikeshed-model";
import {
  DataSpecification,
  DataSpecificationDocumentation,
} from "@dataspecer/core/data-specification/model";
import {pathRelative} from "@dataspecer/core/core/utilities/path-relative";

export async function conceptualModelToBikeshedContent(
  context: BikeshedAdapterContext,
  specification: DataSpecification,
  artefact: DataSpecificationDocumentation,
  conceptualModel: ConceptualModel
): Promise<BikeshedContent> {
  const result = new BikeshedContentSection(
      context.i18n.t("conceptual-model:title"),
      context.i18n.t("conceptual-model:anchor")
  );
  result.content.push(
    new BikeshedContentText(context.i18n.t("conceptual-model:text"))
  );

  result.content.push(mockInsertDiagram(context, specification, artefact));

  for (const entity of Object.values(conceptualModel.classes)) {
    result.content.push(createEntitySection(context, entity));
  }
  return result;
}

function mockInsertDiagram(
  context: BikeshedAdapterContext,
  specification: DataSpecification,
  artefact: DataSpecificationDocumentation
): BikeshedContent {
  const baseUrl = artefact.publicUrl;
  const generatorIdentifier = "plant-uml/image";

  // This is quick workaround. We just search for an artefact from the
  // right generator and include it here.
  for (const artefact of specification.artefacts) {
    if (artefact.generator === generatorIdentifier) {
      return new BikeshedContentText(
          `\n<figure><img src="${pathRelative(baseUrl, artefact.publicUrl)}"><figcaption>${context.i18n.t("conceptual-model:diagram-caption")}</figcaption></figure>`
      );
    }
  }
  return new BikeshedContentText("");
}

function createEntitySection(
  context: BikeshedAdapterContext,
  entity: ConceptualModelClass
): BikeshedContent {
  const result = new BikeshedContentSection(
    classLabel(context, entity),
    classAnchor(context, entity)
  );

  const properties = new BikeshedContentList();
  result.content.push(properties);
  const description = context.selectOptionalString(entity.humanDescription);
  if (description !== null) {
    properties.items.push(new BikeshedContentListItem(context.i18n.t("shared:description"), [description]));
  }
  if (entity.isCodelist) {
    properties.items.push(
      new BikeshedContentListItem(context.i18n.t("shared:codelist.title"), [context.i18n.t("shared:codelist.description")])
    );
  }
  if (entity.cimIri !== null) {
    properties.items.push(
      new BikeshedContentListItem(context.i18n.t("conceptual-model:semantics.title"), [classSemantics(context, entity)])
    );
  }

  entity.properties
    .filter((item) => isAttribute(item))
    .map((item) => createPropertySection(context, entity, item))
    .forEach((item) => result.content.push(item));

  entity.properties
    .filter((item) => !isAttribute(item))
    .map((item) => createPropertySection(context, entity, item))
    .forEach((item) => result.content.push(item));

  return result;
}

function classLabel(
  context: BikeshedAdapterContext,
  model: ConceptualModelClass
): string {
  return context.selectString(model.humanLabel);
}

function classAnchor(
  context: BikeshedAdapterContext,
  model: ConceptualModelClass
): string {
  return context.conceptualClassAnchor(model);
}

function classSemantics(
  context: BikeshedAdapterContext,
  model: ConceptualModelClass
): string {
  const label = classLabel(context, model);
  return context.i18n.t("conceptual-model:semantics.description.class", {name: label, link: `[${label}](${model.cimIri})`});
}

function isAttribute(property: ConceptualModelProperty): boolean {
  for (const type of property.dataTypes) {
    if (type.isAssociation()) {
      return false;
    }
  }
  return true;
}

function createPropertySection(
  context: BikeshedAdapterContext,
  entity: ConceptualModelClass,
  property: ConceptualModelProperty
): BikeshedContent {
  const label = propertyLabel(context, property);
  let heading;
  if (isAttribute(property)) {
    heading = label;
  } else {
    heading = `${context.i18n.t("shared:association")}: ${label}`;
  }

  const result = new BikeshedContentSection(
    heading,
    propertyAnchor(context, entity, property)
  );

  const list = new BikeshedContentList();
  result.content.push(list);
  list.items.push(new BikeshedContentListItem(context.i18n.t("shared:name"), [label]));
  const description = context.selectOptionalString(property.humanDescription);
  if (description !== null) {
    list.items.push(new BikeshedContentListItem(context.i18n.t("shared:description"), [description]));
  }
  list.items.push(
    new BikeshedContentListItem(context.i18n.t("shared:mandatory.title"), [
      isOptional(property) ? context.i18n.t("shared:mandatory.optional") : context.i18n.t("shared:mandatory.mandatory"),
    ])
  );
  list.items.push(
    new BikeshedContentListItem(context.i18n.t("shared:cardinality"), [propertyCardinality(property)])
  );
  const types = propertyTypes(context, property);
  if (types.length > 0) {
    list.items.push(new BikeshedContentListItem(context.i18n.t("shared:type"), types));
  }
  if (property.cimIri !== null) {
    list.items.push(
      new BikeshedContentListItem(context.i18n.t("conceptual-model:semantics.title"), [
        propertySemantics(context, property),
      ])
    );
  }
  return result;
}

function propertyLabel(
  context: BikeshedAdapterContext,
  property: ConceptualModelProperty
): string {
  return context.selectString(property.humanLabel);
}

function propertyAnchor(
  context: BikeshedAdapterContext,
  owner: ConceptualModelClass,
  property: ConceptualModelProperty
): string {
  return context.conceptualPropertyAnchor(owner, property);
}

function isOptional(model: ConceptualModelProperty): boolean {
  return model.cardinalityMin === null || model.cardinalityMin === 0;
}

function propertyCardinality(property: ConceptualModelProperty) {
  let result = "";
  if (property.cardinalityMin === null) {
    result += "0";
  } else {
    result += String(property.cardinalityMin);
  }
  result += " - ";
  if (property.cardinalityMax === null) {
    result += "&infin;";
  } else {
    result += String(property.cardinalityMax);
  }
  return result;
}

function propertyTypes(
  context: BikeshedAdapterContext,
  property: ConceptualModelProperty
): string[] {
  if (property.dataTypes.length === 0) {
    return [];
  }
  const result = [];
  for (const type of property.dataTypes) {
    if (type.isAssociation()) {
      const target = findClass(context, type.pimClassIri);
      const label = classLabel(context, target);
      const href = classAnchor(context, target);
      result.push(`[${label}](#${href})`);
    } else if (type.isAttribute()) {
      // As of now there are no types for attributes on PIM level.
    }
  }
  return result;
}

function findClass(
  context: BikeshedAdapterContext,
  iri: string
): ConceptualModelClass | null {
  const models = Object.values(context.generatorContext.conceptualModels);
  for (const model of models) {
    const classModel = model.classes[iri];
    if (classModel === undefined) {
      continue;
    }
    return classModel;
  }
  return null;
}

function propertySemantics(
  context: BikeshedAdapterContext,
  model: ConceptualModelProperty
): string {
  const label = propertyLabel(context, model);
  return context.i18n.t("conceptual-model:semantics.description.property", {name: label, link: `[${label}](${model.cimIri})`});
}
