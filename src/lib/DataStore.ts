import fs from "fs";
import log from "./Log";

export default class DataStore {
  data: Map<string, any>;

  constructor() {
    this.data = new Map();
  }

  set(key: string, value: any): void {
    this.data.set(key, value);
    this.save();
  }

  remove(key: string): void {
    this.data.delete(key);
    this.save();
  }

  get(key: string): any | undefined {
    return this.data.get(key);
  }

  save(): void {
    log.info("Saving data store");
    fs.writeFile("datastore.json", JSON.stringify(Array.from(this.data)), err => {
      if (err) {
        log.error(`Error saving datastore: ${err}`);
      }
    });
  }

  load(): void {
    log.info("Loading data store");
    if (fs.existsSync("datastore.json")) {
      this.data = new Map(JSON.parse(fs.readFileSync("datastore.json").toString()));
    } else {
      log.info("No datastore found, building blank map");
      this.data = new Map();
    }
  }
}
