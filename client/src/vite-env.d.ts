/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_LOGGER: string;
  readonly VITE_LOGGER_FILTER: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* Ambient module declarations to satisfy missing types */
declare module 'react-gtm-module' {
  export interface TagManagerArgs {
    gtmId?: string;
    dataLayerName?: string;
    auth?: string;
    preview?: string;
  }
  const TagManager: {
    initialize: (args: TagManagerArgs) => void;
    dataLayer: (data: Record<string, unknown>) => void;
  };
  export default TagManager;
}

declare module './getThemeFromEnv' {
  export function getThemeFromEnv(): string;
}

/* Ambient module for missing/loose types from librechat-data-provider */
declare module 'librechat-data-provider' {
  // enums (RBAC)
  export enum PermissionTypes {
    PROMPTS = 'PROMPTS',
    BOOKMARKS = 'BOOKMARKS',
    AGENTS = 'AGENTS',
    MEMORIES = 'MEMORIES',
    MULTI_CONVO = 'MULTI_CONVO',
    TEMPORARY_CHAT = 'TEMPORARY_CHAT',
    RUN_CODE = 'RUN_CODE',
    WEB_SEARCH = 'WEB_SEARCH',
    FILE_SEARCH = 'FILE_SEARCH',
  }

  export enum Permissions {
    SHARED_GLOBAL = 'SHARED_GLOBAL',
    USE = 'USE',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    READ = 'READ',
    READ_AUTHOR = 'READ_AUTHOR',
    SHARE = 'SHARE',
    OPT_OUT = 'OPT_OUT',
  }

  // values
  export const dataService: any;
  export const request: any;
  export const QueryKeys: any;
  export const MutationKeys: any;
  export const DynamicQueryKeys: any;
  export const defaultOrderQuery: any;
  export const Constants: any;
  export const EModelEndpoint: any;
  export const SettingsViews: any;
  export const LocalStorageKeys: any;
  export const Time: any;
  export const Tools: any;
  export const fileConfig: any;
  export const mergeFileConfig: any;
  export const defaultAssistantsVersion: any;
  // missing named export used across the app
  export const alternateName: any;
  export const ConversationListResponse: any;
  export const defaultEndpoints: any;
  export const modularEndpoints: any;
  export const isAgentsEndpoint: any;
  export const isAssistantsEndpoint: any;

  // types
  export type TUser = any;
  export type TPlugin = any;
  export type TAttachment = any;
  export type TMessage = any;
  export type TPreset = any;
  export type TConversation = any;
  export type TSubmission = any;
  export type TConversationTagsResponse = any;
  export type TStartupConfig = any;
  export type TConfig = any;
  export type TEphemeralAgent = any;
  export type MemoriesResponse = any;
  export type TUserMemory = any;
  export type TEndpointsConfig = any;
  export type TModelSpec = any;
  export type SharedLinkItem = any;
  export type SharedLinksListParams = any;

  // common API types used across data-provider
  export type TGenTitleResponse = any;
  export type TGenTitleRequest = any;
  export type TUpdateConversationResponse = any;
  export type TUpdateConversationRequest = any;
  export type updateTagsInConvoOptions = any;
  export type TTagConversationResponse = any;
  export type TTagConversationRequest = any;
  export type ArchiveConversationOptions = any;
  export type TArchiveConversationResponse = any;
  export type TArchiveConversationRequest = any;
  export type MutationOptions<T = any, V = any> = any;
  export type TCreateShareLinkRequest = any;
  export type TSharedLinkResponse = any;
  export type TUpdateShareLinkRequest = any;
  export type DeleteSharedLinkOptions = any;
  export type TDeleteSharedLinkResponse = any;
  export type DeleteSharedLinkContext = any;
  export type UpdateConversationTagOptions = any;
  export type TConversationTagResponse = any;
  export type TConversationTagRequest = any;
  export type DeleteConversationTagOptions = any;
  export type DeleteConversationOptions = any;
  export type TDeleteConversationResponse = any;
  export type TDeleteConversationRequest = any;
  export type DuplicateConvoOptions = any;
  export type TDuplicateConvoResponse = any;
  export type TDuplicateConvoRequest = any;
  export type ForkConvoOptions = any;
  export type TForkConvoResponse = any;
  export type TForkConvoRequest = any;
  export type TImportResponse = any;
  export type UpdatePresetOptions = any;
  export type DeletePresetOptions = any;
  export type PresetDeleteResponse = any;
  export type UploadAvatarOptions = FormData;
  export type AvatarUploadResponse = { url: string };
  export type SpeechToTextOptions = any;
  export type SpeechToTextResponse = any;
  export type TextToSpeechOptions = any;
  export type TextToSpeechResponse = any;
  export type CreateAssistantMutationOptions = any;
  export type Assistant = any;
  export type Agent = any;
  export type TAgentsMap = any;
  export type TAssistantsMap = any;
  export type AssistantCreateParams = any;
  export type UpdateAssistantMutationOptions = any;
  export type AssistantUpdateParams = any;
  export type DeleteAssistantMutationOptions = any;
  export type DeleteAssistantBody = any;
  export type UploadAssistantAvatarOptions = any;
  export type AssistantAvatarVariables = any;
  export type UpdateActionOptions = any;
  export type UpdateActionResponse = any;
  export type UpdateActionVariables = any;
  export type DeleteActionOptions = any;
  export type DeleteActionVariables = any;
  export type VerifyEmailOptions = any;
  export type VerifyEmailResponse = any;
  export type TVerifyEmail = any;
  export type ResendVerifcationOptions = any;
  export type TResendVerificationEmail = any;
  export type AcceptTermsMutationOptions = any;
  export type TAcceptTermsResponse = any;

  // default export for `import type t from 'librechat-data-provider'`
  const defaultExport: any;
  export default defaultExport;
}

/* Ambient module for @react-three/postprocessing to satisfy TS in editor
   Runtime types are provided by the package; this shim avoids red squiggles
   when the editor fails to pick them up via pnpm's node_modules structure. */
declare module '@react-three/postprocessing' {
  // Core composer
  export const EffectComposer: any;
  // Common effects we use
  export const Bloom: any;
  export const Noise: any;
  export const Vignette: any;
  export const SMAA: any;
  export const DepthOfField: any;
  // Fallback default export typing
  const _default: any;
  export default _default;
}
