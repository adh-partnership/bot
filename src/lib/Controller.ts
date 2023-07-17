import Discord from "discord.js";
import Client from "./Client";

class Controller {
    static isVisitor(entry: { controller_type: string }) {
        return entry.controller_type === "visitor";
    }

    static isHomeController(entry: { controller_type: string }) {
        return entry.controller_type === "home";
    }

    static isGuest(entry: { controller_type: string }) {
        return entry.controller_type === "none";
    }

    static isStaff(entry: {roles: { name: string }[]}) {
        let ret = false;
        entry.roles.forEach(role => {
            if (["EC","WM","FE"].includes(role.name)) {
                ret = true;
            }
        });
        return ret;
    }

    static isSeniorStaff(entry: {roles: { name: string }[]}) {
        let ret = false;
        entry.roles.forEach((role: any) => {
            if (["ATM","DATM","TA"].includes(role.name)) {
                ret = true;
            }
        });
        return ret;
    }

    static hasRole(entry: {roles: { name: string }[]}, role: string) {
        for (const r in entry.roles) {
            if (r == role) {
                return true
            }
        }
    }

    static hasCorrectRatingRole(entry: { rating_id: any }, member: Discord.GuildMember, client: Client) {
        const roleName = Object.keys(client.roleCache).find(key => client.roleCache[key] === entry.rating_id);
        return member.roles.cache.find(r => r.name === roleName)?.id != null;
    }

    // Ratings: "OBS", "S1", "S2", "S3", "C1", "C2", "C3", "I1", "I2", "I3", "SUP", "ADM"

    static getThirdArgument(entry: any) {
        if (this.hasRole(entry, "atm")) return " | ATM";
        if (this.hasRole(entry, "datm")) return " | DATM";
        if (this.hasRole(entry, "ta")) return " | TA";
        if (this.hasRole(entry, "ec")) return " | EC";
        if (this.hasRole(entry, "fe")) return " | FE";
        if (this.hasRole(entry, "wm")) return " | WM";
        if (this.hasRole(entry, "events")) return " | AEC";
        if (this.hasRole(entry, "web")) return " | AWM";

        if (entry.rating == "I1" && this.isHomeController(entry)) return " | INS";
        if (this.hasRole(entry, "MTR")) return " | MTR";
        return "";
    }

    static getThirdArgumentDenver(entry: any) {
        if (this.isHomeController(entry)) {
            if (this.hasRole(entry, "ATM")) return " | ATM";
            if (this.hasRole(entry, "DATM")) return " | DATM";
            if (this.hasRole(entry, "TA")) return " | TA";
            if (this.hasRole(entry, "EC")) return " | EC";
            if (this.hasRole(entry, "FE")) return " | FE";
            if (this.hasRole(entry, "WM")) return " | WM";
            if (this.hasRole(entry, "MTR")) return " | MTR";
        } else {
            return ` | ${entry.visitor_from}`;
        }

        return "";
    }
}

export default Controller;