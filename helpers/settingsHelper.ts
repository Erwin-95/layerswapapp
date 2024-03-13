import { Token } from "../Models/Network";
import { Layer } from "../Models/Layer";
import { THEME_COLORS } from "../Models/Theme";

export function GetDefaultAsset(layer: Layer, asset: string): Token | undefined {
    return layer
        ?.tokens
        ?.find(a => a.symbol === asset)
}

export const getThemeData = async (query: any) => {
    try {
        if (!query)
            return null
        const theme_name = query.theme || query.appName || query.addressSource
        // const internalApiClient = new InternalApiClient()
        // const themeData = await internalApiClient.GetThemeData(theme_name);
        // result.themeData = themeData as ThemeData;
        return THEME_COLORS[theme_name] || null;
    }
    catch (e) {
        console.log(e)
        return null
    }
}