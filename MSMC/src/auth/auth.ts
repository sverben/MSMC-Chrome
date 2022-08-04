import { lexcodes, windowProperties, lst, errResponse, err } from "../assets.js";
import xbox from "./xbox.js";
/**
 * This library's supported gui frameworks. 
 * (Raw requires no extra dependencies, use it if you're using some unknown framework!)
 */
export type framework = "electron" | "nwjs" | "raw";
/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 * 
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or launch functions under either Electron or NW.js
 */
export type prompt = "login" | "none" | "consent" | "select_account";
/**
 * The Oauth2 details needed to log you in. 
 * 
 * Resources
 * 1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
 * 2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
 * 3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
 * 
 */
export interface MStoken {
    client_id: string,
    redirect: string,
    clientSecret?: string,
    prompt?: prompt
}
export interface msAuthToken {
    token_type: string,
    expires_in: number,
    scope: string,
    access_token: string,
    refresh_token: string,
    user_id: string,
    foci: string
}


function mojangAuthToken(prompt?: prompt) {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt
    }
    return token;
}
export class loader {
    auth: auth
    constructor(auth: auth) {
        this.auth = auth;
    }

    load(code: lexcodes) {
        this.auth.emit("load", code);
    }
}

export class auth {
    token: MStoken;
    constructor(prompt?: prompt)
    constructor(token: MStoken)
    constructor(token?: MStoken | prompt) {
        if (!token)
            console.warn("[MSMC]: Just a note. No prompt variable was specified. Assuming value to be 'login' to remain consistent with older releases")
        this.token = (!token || typeof token == "string") ? mojangAuthToken(token as prompt || "login") : token;


    }
    createLink() {
        return (
            "https://login.live.com/oauth20_authorize.srf" +
            "?client_id=" +
            this.token.client_id +
            "&response_type=code" +
            "&redirect_uri=" + encodeURIComponent(this.token.redirect) +
            "&scope=XboxLive.signin%20offline_access" +
            (this.token.prompt ? "&prompt=" + this.token.prompt : "") +
            "&mkt=" + lst('gui.market')
        );
    }
    emit(eventName: string | symbol, ...args: any[]): boolean {
        return true
    }
    load(code: lexcodes) {
        this.emit("load", code);
    }
    login(code: string) {
        const body = (
            "client_id=" + this.token.client_id +
            (this.token.clientSecret ? "&client_secret=" + this.token.clientSecret : "") +
            "&code=" + code +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + this.token.redirect)
        return this._get(body);
    }
    refresh(MS: msAuthToken): Promise<xbox>
    refresh(refreshToken: string): Promise<xbox>
    refresh(MS: msAuthToken | string) {
        const refresh = typeof MS == 'string' ? MS : MS.refresh_token;
        const body = (
            "client_id=" + this.token.client_id +
            (this.token.clientSecret ? "&client_secret=" + this.token.clientSecret : "") +
            "&refresh_token=" + refresh +
            "&grant_type=refresh_token")
        return this._get(body)
    }

    async launch(framework: framework, windowProperties?: windowProperties) {}

    async server(port = 0) {
        if (this.token.redirect.startsWith('http://localhost/') || this.token.redirect.startsWith('http://127.')) err("error.state.invalid.redirect")
        throw "error.state.invalid"
    }

    private async _get(body: string): Promise<xbox> {
        this.load('load.auth.microsoft')
        var MS_Raw = await fetch("https://login.live.com/oauth20_token.srf", {
            method: "post", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        errResponse(MS_Raw, "error.auth.microsoft")

        var MS = await MS_Raw.json();
        this.load('load.auth.xboxLive.1')
        var rxboxlive = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
            method: "post",
            body: JSON.stringify({
                Properties: {
                    AuthMethod: "RPS",
                    SiteName: "user.auth.xboxlive.com",
                    RpsTicket: `d=${MS.access_token}` // your access token from step 2 here
                },
                RelyingParty: "http://auth.xboxlive.com",
                TokenType: "JWT"
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        errResponse(rxboxlive, "error.auth.xboxLive")
        var token = await rxboxlive.json();
        return new xbox(this, MS, token);
    }
}
export default auth;


