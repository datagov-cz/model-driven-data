import React from "react";
import {Alert, Box, Container, Fab, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';
import {useSingleGeneratedFileArtifact} from "./use-single-generated-file-artifact";
import {Light as SyntaxHighlighter, PrismLight as PrismSyntaxHighlighter} from "react-syntax-highlighter";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {coy} from "react-syntax-highlighter/dist/esm/styles/prism";
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import sparql from 'react-syntax-highlighter/dist/esm/languages/prism/sparql';
import {useAsyncMemo} from "../../hooks/use-async-memo";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsonld", json);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("xsd", xml);
SyntaxHighlighter.registerLanguage("xslt", xml);
PrismSyntaxHighlighter.registerLanguage("sparql", sparql);

/**
 * Component that renders single artifact result by generator id.
 */
export const SingleArtifactPreview: React.FC<{
    generatorIdentifier: string,
}> = ({generatorIdentifier}) => {
    const {t} = useTranslation("artifacts");

    const [memoryStreamDictionary] = useSingleGeneratedFileArtifact(generatorIdentifier);

    const [files] = useAsyncMemo(async () => {
        if (!memoryStreamDictionary) {
            return [];
        }
        const files = await memoryStreamDictionary.list();
        const result: {filename: string, content: string, extension: string}[] = [];
        for (const file of files) {
            let content = await memoryStreamDictionary.readPath(file).read();
            const filename = file.split("/").pop()!;

            const extension = filename.split(".").pop() as string;

            result.push({filename, content, extension});
        }
        return result;
    }, [memoryStreamDictionary]);

    if (!memoryStreamDictionary) {
        return <Alert severity="error"><strong>{t("error")}</strong></Alert>;
    }

    return <>
        {files?.map(file => <Box sx={{whiteSpace: "pre"}}>
            <Typography variant="h5" sx={{mb: 2}}>{file.filename}</Typography>
            {["sparql"].includes(file.extension) ?
            <PrismSyntaxHighlighter language={file.extension} style={coy}>{file.content}</PrismSyntaxHighlighter>
            :
            <SyntaxHighlighter language={file.extension} style={githubGist}>{file.content}</SyntaxHighlighter>
            }
        </Box>)}
    </>;
}

/**
 * Previews a generated artifact content in a dialog.
 * @param artifactPreview
 * @param setArtifactPreview
 * @constructor
 */
export const MultipleArtifactsPreview: React.FC<{
    artifactPreview: string[],
    setArtifactPreview: (value: string[]) => void,
}> = ({artifactPreview, setArtifactPreview}) => {
    const {t} = useTranslation("ui");
    if (artifactPreview.length === 0) {
        return null;
    }
    return <Container>
        {artifactPreview.map(generatorId =>
            <Paper style={{padding: "1rem", margin: "1rem 0"}}>
                <Fab
                    variant="extended"
                    size="small"
                    color="primary"
                    aria-label="edit"
                    style={{float: "right", marginLeft: "2rem"}}
                    onClick={() => setArtifactPreview(artifactPreview.filter(a => a !== generatorId))}
                >
                    <CloseIcon/>{" "}
                    {t("close")}
                </Fab>
                <SingleArtifactPreview
                    key={generatorId}
                    generatorIdentifier={generatorId}
                />
            </Paper>
        )}
    </Container>
}
