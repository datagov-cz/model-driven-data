// @see {@link ../configuration/README.md}

import {DeepPartial} from "@dataspecer/core/core/utilities/deep-partial";

export const DefaultJsonConfiguration =  {
    /**
     * Key of property representing ID of the entity.
     * If set to null, the property won't be used.
     */
    jsonIdKeyAlias: "id" as string | null,

    /**
     * Key of property representing the type of the entity.
     * If set to null, the property won't be used.
     */
    jsonTypeKeyAlias: "type" as string | null,

    /**
     * Value of @base json-ld property in context.
     */
    jsonLdBaseUrl: "http://example.com/turisticke-cile/" as string | null,

    /**
     * How to treat root objects cardinality.
     * - "single" - root object is a single object
     * - "array" - root object is an array of objects
     * - "object-with-array" - root object is an object with a single property which is an array of objects. The name of the property is defined by {jsonRootCardinalityObjectKey}
     */
    jsonRootCardinality: "object-with-array" as "single" | "array" | "object-with-array",

    /**
     * Name of the property in root object which contains array of objects.
     * This is used only if {jsonRootCardinality === "object-with-array"}
     */
    jsonRootCardinalityObjectKey: "položky" as string,

    /**
     * How types of JSON objects are reresented.
     */
    jsonDefaultTypeKeyMapping: "technical-label" as "human-label" | "technical-label",

    /**
     * Language used for label if {jsonDefaultTypeKeyMapping === "human-label"}
     */
    jsonDefaultTypeKeyMappingHumanLabelLang: "en" as string,
}

export type JsonConfiguration = typeof DefaultJsonConfiguration;

export interface ConfigurationWithJson {
    [JsonConfigurator.KEY]?: DeepPartial<JsonConfiguration>;
}

export class JsonConfigurator {
    static KEY = "json" as const;

    static getFromObject(configurationObject: object | null): DeepPartial<JsonConfiguration> {
        return configurationObject?.[JsonConfigurator.KEY] ?? {};
    }

    static setToObject(configurationObject: object, options: DeepPartial<JsonConfiguration>): ConfigurationWithJson {
        return {...configurationObject, [JsonConfigurator.KEY]: options};
    }

    static merge(...options: DeepPartial<JsonConfiguration>[]): DeepPartial<JsonConfiguration> {
        let result: DeepPartial<JsonConfiguration> = {};
        for (const option of options) {
            result = {...result, ...option};
        }

        return result;
    }

    static getDefault() {
        return DefaultJsonConfiguration;
    }
}
