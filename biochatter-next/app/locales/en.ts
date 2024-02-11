import { getClientConfig } from "../config/client";
import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";

// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const isApp = !!getClientConfig()?.isApp;
const en: LocaleType = {
  WIP: "Coming Soon...",
  Error: {
    Unauthorized: isApp
      ? "Invalid API Key, please check it in [Settings](/#/settings) page."
      : "Unauthorized access, please enter access code in [auth](/#/auth) page, or enter your OpenAI API Key.",
  },
  Auth: {
    Title: "Need Access Code",
    Tips: "Please enter access code below",
    SubTips: "Or enter your OpenAI API Key",
    Input: "access code",
    Confirm: "Confirm",
    Later: "Later",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    EditMessage: {
      Title: "Edit All Messages",
      Topic: {
        Title: "Topic",
        SubTitle: "Change the current topic",
      },
    },
    Actions: {
      ChatList: "Go To Chat List",
      CompressedHistory: "Compressed History Memory Prompt",
      Export: "Export All Messages as Markdown",
      Copy: "Copy",
      Stop: "Stop",
      Retry: "Retry",
      Pin: "Pin",
      PinToastContent: "Pinned 1 messages to contextual prompts",
      PinToastAction: "View",
      Delete: "Delete",
      Edit: "Edit",
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with mask",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "To Latest",
      Theme: {
        auto: "Auto",
        light: "Light Theme",
        dark: "Dark Theme",
      },
      Prompt: "Prompts",
      Masks: "Persona",
      Clear: "Clear Context",
      Settings: "Settings",
    },
    Rename: "Rename Chat",
    Typing: "Typing…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      return inputHints + ", / to search prompts, : to use commands";
    },
    Send: "Send",
    Config: {
      Reset: "Reset to Default",
      SaveAs: "Save as Persona",
    },
    IsContext: "Contextual Prompt",
    RAG: {
      Description: "While Large Language Models have access to vast amounts of knowledge, this knowledge only includes what was present in their training set, and thus excludes very current research as well as research articles that are not open access. To fill in the gaps of the model's knowledge, we include a document summarisation approach that stores knowledge from user-provided documents in a vector database, which can be used to supplement the model prompt by retrieving the most relevant contents of the provided documents. This process builds on the unique functionality of vector databases to perform similarity search on the embeddings of the documents' contents.",
      OK: "OK",
      Reset: "Reset",
      Documents: {
        Label: "Documents",
        DocumentsHints: "To use the feature, please enable it in the settings panel. →",
        DocumentsPrompts: "Upload documents one at a time. Upon upload, the document is split according to the settings and the embeddings are stored in the connected vector database.",
        UploadingMessage: "Embedding and Saving",
      },
      Settings: {
        Label: "Settings",
        ConnectionStatus: "Connection status",
        Refresh: "reconnect",
        Reconnect: "reconnect",
        DatabaseURL: "Database URL",
        DatabasePort: "Database port",
        DatabaseUser: "Database user",
        DatabasePassword: "Database password",
        UseRAG: "Use Retrieval Augmented Generation",
        SplitByChar: "Split by characters (instead of tokens)",
        ChunkSize: {
          Label: "Chunk size",
          subLabel: "How large should the embedded text fragments be?"
        },
        Overlap: {
          Label: "Overlap",
          subLabel: "Should the chunks overlap, and by how much?",
        },
        ResultsNum: {
          Label: "Number of results",
          subLabel: "How many chunks should be used to supplement the prompts",
        }
      }
    },
  },
  Export: {
    Title: "Export Messages",
    Copy: "Copy All",
    Download: "Download",
    MessageFromYou: "Message From You",
    MessageFromChatGPT: "Message From ChatGPT",
    Share: "Share to ShareGPT",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown or PNG Image",
    },
    IncludeContext: {
      Title: "Including Context",
      SubTitle: "Export context prompts in mask or not",
    },
    Steps: {
      Select: "Select",
      Preview: "Preview",
    },
    Image: {
      Toast: "Capturing Image...",
      Modal: "Long press or right click to save image",
    },
  },
  Select: {
    Search: "Search",
    All: "Select All",
    Latest: "Select Latest",
    Clear: "Clear",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
    Copy: "Copy Memory",
    Reset: "Reset Session",
    ResetConfirm:
      "Resetting will clear the current conversation history and historical memory. Are you sure you want to reset?",
  },
  Home: {
    NewChat: "New Chat",
    DeleteChat: "Confirm to delete the selected conversation?",
    DeleteToast: "Chat Deleted",
    Revert: "Revert",
  },
  Welcome: {
    Name: "Help",
    Page: {
      Title: "Welcome to BioChatter!",
      NotShow: "Never Show Again",
      What: "What?",
      WhatMessages: [
        "A platform for the application of Large Language Models (LLMs) in biomedical research.",
        "A way to make LLMs more __useful__ and __trustworthy__.",
        "A means to make biomedical research more reproducible.",
        "A platform for contextualisation of biomedical results.",
        "An interface for the intuitive interaction with current cutting-edge AI.",
        "An __open-source__ project.",
        "A way to make biomedical research more efficient.",
        "A time-saver.",
      ],
      How: "How?",
      HowMessages: [
        "Building wrappers around LLMs to tune their responses and ameliorate their shortcomings.",
        "Connecting to complementary technology, such as (vector) databases and model chaining.",
        "Being playful and experimental, and having fun!",
        "Coming together as a community and being communicative.",
        "Collaborating on the future of biomedical research.",
        "Engineering prompts to make LLMs more useful.",
        "Following open science principles.",
        "Being transparent about the limitations of the technology.",
        "Being modular and extensible.",
        "Injecting prior knowledge into LLM queries.",
      ],
      Disclaimer: "For more information on the platform, please see our [preprint](https://arxiv.org/abs/2305.06488)!\nIf you'd like to contribute to the project, please find us on [GitHub](https://github.com/biocypher/biochatter-next) or [Zulip](https://biocypher.zulipchat.com/). We'd love to hear from you!",
      About: {
        Name: "About",
        Title: "About",
        Citation: "BioChatter is developed by a multicultural team over on [GitHub](https://github.com/biocypher) ([BioChatter](https://github.com/biocypher/biochatter), [BioChatter Server](https://github.com/biocypher/biochatter-server), [BioChatter Next](https://github.com/biocypher/biochatter-next), [BioChatter Light](https://github.com/biocypher/biochatter-light)), led by [Sebastian Lobentanzer](https://slobentanzer.github.io/). Biochatter Next was developed by Shaohong Feng and Cankun Wang, and is hosted by [BMBL](https://u.osu.edu/bmbl).",
        ListTitle: "BioChatter is a tool to integrate biomedical research with current developments in Large Language Models in a user-friendly package. It works by setting up a topic-constrained conversation with a pre-trained language model. Optionally, auxiliary technologies such as knowledge graphs and vector databases can be seamlessly integrated into the conversations. The main benefits of this approach are:",
        ListItems: [
          "Transparency to increase trust in the framework and LLM-driven insights",
          "Modularity of components: use any model, any prompt, and any database",
          "Native connectivity to BioCypher knowledge graphs and semantic search via vector database embeddings",
          "Integrated safeguards to prevent false information and comparison to curated prior knowledge",
          "Confidentiality of the shared data (as opposed to the ChatGPT interface, which allows storage and reuse of the user's prompts by OpenAI)"
        ],
        Heading2: "About the models",
        Models: "We offer support of proprietary models via the OpenAI API, as well as open source models via deployment mechanisms such as the Xorbits Inference framework. We also allow running models fully browser based using web assembly integration. You can select models in the settings panel.",
      },
    }
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",
    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "All Languages",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },
    InjectSystemPrompts: {
      Title: "Inject System Prompts",
      SubTitle: "Inject a global system prompt for every request",
    },
    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Latest version",
      CheckUpdate: "Check Update",
      IsChecking: "Checking update...",
      FoundUpdate: (x: string) => `Found new version: ${x}`,
      GoToUpdate: "Update",
    },
    SendKey: "Send Key",
    Theme: "Theme",
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "Send Preview Bubble",
      SubTitle: "Preview markdown in bubble",
    },
    AutoGenerateTitle: {
      Title: "Auto Generate Title",
      SubTitle: "Generate a suitable title based on the conversation content",
    },
    Sync: {
      CloudState: "Last Update",
      NotSyncYet: "Not sync yet",
      Success: "Sync Success",
      Fail: "Sync Fail",

      Config: {
        Modal: {
          Title: "Config Sync",
          Check: "Check Connection",
        },
        SyncType: {
          Title: "Sync Type",
          SubTitle: "Choose your favorite sync service",
        },
        Proxy: {
          Title: "Enable CORS Proxy",
          SubTitle: "Enable a proxy to avoid cross-origin restrictions",
        },
        ProxyUrl: {
          Title: "Proxy Endpoint",
          SubTitle:
            "Only applicable to the built-in CORS proxy for this project",
        },

        WebDav: {
          Endpoint: "WebDAV Endpoint",
          UserName: "User Name",
          Password: "Password",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "Backup Name",
          Password: "UpStash Redis REST Token",
        },
      },

      LocalState: "Local Data",
      Overview: (overview: any) => {
        return `${overview.chat} chats，${overview.message} messages，${overview.prompt} prompts，${overview.mask} masks`;
      },
      ImportFailed: "Failed to import from file",
    },
    Welcome: {
      Splash: {
        Title: "Welcome Splash Screen",
        SubTitle: "Show a welcome splash screen after loading the app",
      },
    },
    Mask: {
      Splash: {
        Title: "Mask Splash Screen",
        SubTitle: "Show a mask splash screen before starting new chat",
      },
      Builtin: {
        Title: "Hide Builtin Masks",
        SubTitle: "Hide builtin masks in mask list",
      },
    },
    Prompt: {
      Disable: {
        Title: "Disable auto-completion",
        SubTitle: "Input / to trigger auto-completion",
      },
      List: "Prompt List",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} built-in, ${custom} user-defined`,
      Edit: "Edit",
      Modal: {
        Title: "Prompt List",
        Add: "Add One",
        Search: "Search Prompts",
      },
      EditModal: {
        Title: "Edit Prompt",
      },
    },
    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },

    Usage: {
      Title: "Account Balance",
      SubTitle(used: any, total: any) {
        return `Used this month $${used}, subscription $${total}`;
      },
      IsChecking: "Checking...",
      Check: "Check",
      NoAccess: "Enter API Key to check balance",
    },
    Access: {
      AccessCode: {
        Title: "Access Code",
        SubTitle: "Access control Enabled",
        Placeholder: "Enter Code",
      },
      CustomEndpoint: {
        Title: "Custom Endpoint",
        SubTitle: "Use custom Azure or OpenAI service",
      },
      Provider: {
        Title: "Model Provider",
        SubTitle: "Select Azure or OpenAI",
      },
      OpenAI: {
        ApiKey: {
          Title: "OpenAI API Key",
          SubTitle: "User custom OpenAI Api Key",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "OpenAI Endpoint",
          SubTitle: "Must starts with http(s):// or use /api/openai as default",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Azure Api Key",
          SubTitle: "Check your api key from Azure console",
          Placeholder: "Azure Api Key",
        },

        Endpoint: {
          Title: "Azure Endpoint",
          SubTitle: "Example: ",
        },

        ApiVerion: {
          Title: "Azure Api Version",
          SubTitle: "Check your api version from azure console",
        },
      },
      CustomModel: {
        Title: "Custom Models",
        SubTitle: "Custom model options, seperated by comma",
      },
    },

    Model: "Model",
    Temperature: {
      Title: "Temperature",
      SubTitle: "A larger value makes the more random output",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Do not alter this value together with temperature",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximum length of input tokens and generated tokens",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "A larger value increases the likelihood to talk about new topics",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "A larger value decreasing the likelihood to repeat the same line",
    },
  },
  Store: {
    DefaultTopic: "New Conversation",
    BotHello: "Hello! How can I assist you today?",
    Error: "Something went wrong, please try again later.",
    Prompt: {
      History: (content: string) =>
        "This is a summary of the chat history as a recap: " + content,
      Topic:
        "Please generate a four to five word title summarizing our conversation without any lead-in, punctuation, quotation marks, periods, symbols, or additional text. Remove enclosing quotation marks.",
      Summarize:
        "Summarize the discussion briefly in 200 words or less to use as a prompt for future context.",
    },
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Download: {
    Success: "Content downloaded to your directory.",
    Failed: "Download failed.",
  },
  Context: {
    Toast: (x: any) => `With ${x} contextual prompts`,
    Edit: "Current Chat Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared",
    Revert: "Revert",
  },
  Plugin: {
    Name: "Plugin",
  },
  FineTuned: {
    Sysmessage: "You are an assistant that",
  },
  KG: {
    Page: {
      Title: "Knowledge Graph Settings"
    },
    Description: "This section allows connecting to a DBMS and querying it by asking natural language questions about the knowledge graph. It works by sharing some information about the [BioCypher](https://biocypher.org) KG with the LLM in the form of a schema configuration, which can be enriched by information gained in building the graph. In the former case, this is achieved by using the `schema_config.yaml` file used to configure BioCypher, while the latter uses the `schema_info.yaml` that can be generated by BioCypher after the KG has been built. Using the `schema_info.yaml` file is recommended, as it contains more information about the graph. ",
    SchemaConfiguration: {
      Label: "Schema Configuration File",
      DocumentsHints: "To use the feature, please enable it in the settings panel. →",
      DocumentsPrompts: "Upload schema configuration or info file.",
      UploadingMessage: "Embedding and Saving",
    },
    Settings: {
      Label: "Settings",
      ConnectionStatus: "Connection status",
      Refresh: "reconnect",
      Reconnect: "reconnect",
      DatabaseURL: "Database URL",
      DatabasePort: "Database port",
      DatabaseUser: "Database user",
      DatabasePassword: "Database password",
      useKG: "Use Knowledge Graph",      
      ResultsNum: {
        Label: "Number of results",
        subLabel: "How many results should be used to supplement the prompts",
      }
    }
  },
  RAG: {
    Page: {
      Title: "RAG Settings",
    },
    Description: "While Large Language Models have access to vast amounts of knowledge, this knowledge only includes what was present in their training set, and thus excludes very current research as well as research articles that are not open access. To fill in the gaps of the model's knowledge, we support Retrieval-Augmented Generation (RAG) to store knowledge from user-provided documents in a vector database, which can be used to supplement the model prompt by retrieving the most relevant contents of the provided documents. This process builds on the unique functionality of vector databases to perform similarity search on the embeddings of the documents' contents.",
    OK: "OK",
    Reset: "Reset",
    Documents: {
      Label: "Documents",
      DocumentsHints: "To use the feature, please enable it in the settings panel. →",
      DocumentsPrompts: "Upload documents one at a time. Upon upload, the document is split according to the settings and the embeddings are stored in the connected vector database.",
      UploadingMessage: "Embedding and Saving",
    },
    Settings: {
      Label: "Settings",
      ConnectionStatus: "Connection status",
      Refresh: "reconnect",
      Reconnect: "reconnect",
      DatabaseURL: "Database URL",
      DatabasePort: "Database port",
      DatabaseUser: "Database user",
      DatabasePassword: "Database password",
      UseRAG: "Use Retrieval Augmented Generation",
      SplitByChar: "Split by:",
      ChunkSize: {
        Label: "Chunk size",
        subLabel: "How large should the embedded text fragments be?"
      },
      Overlap: {
        Label: "Overlap",
        subLabel: "Should the chunks overlap, and by how much?",
      },
      ResultsNum: {
        Label: "Number of results",
        subLabel: "How many chunks should be used to supplement the prompts",
      }
    }
  },
  Mask: {
    Name: "New Persona",
    Page: {
      Title: "Prompt Template",
      SubTitle: (count: number) => `${count} prompt templates`,
      Search: "Search Templates",
      Create: "Create",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Chat",
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Edit Prompt Template ${readonly ? "(readonly)" : ""}`,
      Download: "Download",
      Clone: "Clone",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Bot Name",
      Sync: {
        Title: "Use Global Config",
        SubTitle: "Use global config in this chat",
        Confirm: "Confirm to override custom config with global config?",
      },
      HideContext: {
        Title: "Hide Context Prompts",
        SubTitle: "Do not show in-context prompts in chat",
      },
      Share: {
        Title: "Share This Mask",
        SubTitle: "Generate a link to this mask",
        Action: "Copy Link",
      },
    },
  },
  NewChat: {
    Return: "Return",
    Skip: "Just Start",
    Title: "Pick a Persona",
    SubTitle: "Choose the right Persona to chat with BioChatter",
    More: "Find More",
    NotShow: "Never Show Again",
    ConfirmNoShow: "Confirm to disable？You can enable it in settings later.",
  },

  UI: {
    Confirm: "Confirm",
    Cancel: "Cancel",
    Close: "Close",
    Create: "Create",
    Edit: "Edit",
    Export: "Export",
    Import: "Import",
    Sync: "Sync",
    Config: "Config",
    DorpZone: {
      FileWarning: "File must be 10MB or smaller",
      UploadPrompts: "Drag and drop file here",
      UploadHints: "Limit 10MB per file • ",
      BrowseButton: {
        Label: "Browse files",
      },
      UploadButton: {
        Label: "Upload"
      }
    }
  },
  Exporter: {
    Description: {
      Title: "Only messages after clearing the context will be displayed",
    },
    Model: "Model",
    Messages: "Messages",
    Topic: "Topic",
    Time: "Time",
  },

  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },
  Sidebar: {
    AppTitle: "BioChatter",
    AppSubtitle: "Conversational AI in biomedicine",
    AppDescription: "BioChatter is part of the BioCypher ecosystem, connecting natively to BioCypher knowledge graphs."
  },
  LayoutMetadata: {
    AppTitle: "BioChatter",
    AppDescription: "Conversational AI in biomedicine"
  }
};

export default en;
