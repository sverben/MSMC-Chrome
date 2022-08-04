/**
 * A copy of the user object mclc uses
 */
export type mclcUser = {
    access_token: string;
    client_token?: string;
    uuid: string;

    name?: string;
    meta?: { type: "mojang" | "msa" | "legacy", xuid?: string, demo?: boolean };
    user_properties?: Partial<any>;
}


/**
 * If the exact code isn't founnd. The lexicon string is split up and shaved down till it finds a description for the code. 
 * 
 * For example; error.auth.microsoft will be shortend to error.auth if error.auth.microsoft isn't found 
 */
export let lexicon = {
    //Error
    "error": "An unknown error has occured",
    "error.auth": "An unknown authentication error has occured",
    "error.auth.microsoft": "Failed to login to Microsoft account",
    "error.auth.xboxLive": "Failed to login to Xbox Live",
    "error.auth.xsts": "Unknown error occured when attempting to optain an Xbox Live Security Token",
    "error.auth.xsts.userNotFound": "The given Microsoft account doesn't have an Xbox account",
    "error.auth.xsts.bannedCountry": "The given Microsoft account is from a country where Xbox live is not available",
    "error.auth.xsts.child": "The account is a child (under 18) and cannot proceed unless the account is added to a Family account by an adult",
    "error.auth.xsts.child.SK": "South Korean law: Go to the Xbox page and grant parental rights to continue logging in.",

    "error.auth.minecraft": "Unknown error occured when attempting to login to Minecraft",
    "error.auth.minecraft.login": "Failed to authenticate with Mojang with given Xbox account",
    "error.auth.minecraft.profile": "Failed to fetch minecraft profile",
    "error.auth.minecraft.entitlements": "Failed to fetch player entitlements",

    "error.gui": "An unknown gui framework error has occured",
    "error.gui.closed": "Gui closed by user",
    "error.gui.raw.noBrowser": "no chromium browser was set, cannot continue!",

    "error.state.invalid": "[Internal]: Method not implemented.",
    "error.state.invalid.gui": "[Internal]: Invalid gui framework.",
    "error.state.invalid.redirect": "[Internal]: The token must have a redirect starting with 'http://localhost/' for this function to work!",
    "error.state.invalid.electron": "[Internal]: It seems you're attempting to load electron on the frontend. A critical function is missing!",
    //Load events
    "load": "Generic load event",
    "load.auth": "Generic authentication load event",
    "load.auth.microsoft": "Logging into Microsoft account",
    "load.auth.xboxLive": "Logging into Xbox Live",
    "load.auth.xboxLive.1": "Logging into Xbox Live",
    "load.auth.xboxLive.2": "Authenticating with xbox live",
    "load.auth.xsts": "Generating Xbox Live Security Token",

    "load.auth.minecraft": "Generic Minecraft login flow event",
    "load.auth.minecraft.login": "Authenticating with Mojang's servers",
    "load.auth.minecraft.profile": "Fetching player profile",
    "load.auth.minecraft.gamepass": "[experimental!] Checking if a user has gamepass",
    //Gui components
    "gui": "Gui component",
    "gui.title": "Sign in to your account",
    "gui.market": "en-US"
}

export type lexcodes = keyof typeof lexicon;

export function lst(lexcodes: lexcodes) {
    const lex = lexcodes.split(".");
    do {
        const l = lex.join('.');
        if (l in lexicon) { return lexicon[l]; }
        lex.pop();
    } while (lex.length > 0)
    return lexcodes;
}

export interface exptOpts {
    ts: lexcodes;
    response: Response;
}

export function err(ts: lexcodes) {
    throw ts;
}

export function errResponse(response: Response, ts: lexcodes) {
    if (!response.ok) throw { response, ts }
}
export function wrapError(code: string | exptOpts | any) {
    let name: lexcodes;
    let opt: exptOpts | null;
    if (typeof code == 'string') {
        name = code as lexcodes;
    }
    else {
        opt = code;
        name = opt.ts;
    }
    let message = lst(name || "error");
    return { name, opt, message };
}

/**
 * Used by graphical Electron and NW.js integrations to set the properties of the generated pop-up
 */
export interface windowProperties {
    width: number,
    height: number,
    /**Raw ignores this property!*/
    resizable?: boolean,
    /**Raw only: Stops MSMC from passing through the browser console log*/
    suppress?: boolean,
    [key: string]: any
}

export interface mcProfile {
    id: string,
    name: string,
    skins: Array<
        {
            id: string,
            state: 'ACTIVE',
            url: string,
            variant: 'SLIM' | 'CLASSIC'
        }
    >,
    capes: Array<
        {
            id: string,
            state: 'ACTIVE',
            url: string,
            alias: string
        }
    >,
    demo?: boolean
}

export interface gmlluser {
    profile: {
        id: string,
        name: string,
        xuid?: string,
        type?: "mojang" | "msa" | "legacy",
        demo?: boolean,
        properties?: {
            //We're still reverse engineering what this property is used for...
            //This likely does not work anymore...
            twitch_access_token: string
        }
    },
    access_token?: string
}
export function getDefaultWinProperties(): windowProperties {
    return {
        width: 500,
        height: 650,
        resizable: false,
        title: lst("gui.title")
    };
}