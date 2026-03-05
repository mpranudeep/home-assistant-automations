import * as ko from "knockout";
import ArrayDataProvider = require("ojs/ojarraydataprovider");

type Novel = {
  id: string,
  name: string,
  sources: Source[]
};
type Source = {
  id: string,
  name: string,
  translateEnabled: boolean,
  refinementEnabled: boolean
};

class NovelsViewModel {
  novelsArray = ko.observableArray<Novel>([]);
  novels = new ArrayDataProvider(this.novelsArray, { keyAttributes: "id" });

  newNovelName = ko.observable("");
  // Source form state mapped by novelId (for multi-edit)
  newSourceName = ko.observable("");
  newSourceFlags = ko.observableArray<string>([]); // ["translate", "refine"]

  // Progress per source id
  progressMap = ko.observable({} as Record<string, string>);

  constructor() {
    this.fetchNovels();
  }

  async fetchNovels() {
    const resp = await fetch("/novels");
    if (resp.ok) {
      const data = await resp.json();
      this.novelsArray(data);
      await this.loadProgressAll();
    }
  }

  async addNovel(event: CustomEvent) {
    event.preventDefault?.();
    if (!this.newNovelName()) return;
    const resp = await fetch("/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: this.newNovelName() })
    });
    if (resp.ok) {
      this.newNovelName("");
      await this.fetchNovels();
    }
  }

  async deleteNovel(novel: Novel) {
    if (!novel.id) return;
    await fetch(`/novels/${novel.id}`, { method: "DELETE" });
    await this.fetchNovels();
  }

  async addSource(novel: Novel, event: CustomEvent) {
    event.preventDefault?.();
    if (!this.newSourceName()) return;
    const payload = {
      name: this.newSourceName(),
      translateEnabled: this.newSourceFlags().includes("translate"),
      refinementEnabled: this.newSourceFlags().includes("refine")
    };
    await fetch(`/novels/${novel.id}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    this.newSourceName("");
    this.newSourceFlags([]);
    await this.fetchNovels();
  }

  async deleteSource(novel: Novel, source: Source) {
    await fetch(`/novels/${novel.id}/sources/${source.id}`, { method: "DELETE" });
    await this.fetchNovels();
  }

  // User chapter progress management
  getProgress(source: Source): string {
    return this.progressMap()[source.id] || "";
  }
  async setProgress(novelId: string, sourceId: string, val: string) {
    const userId = this.getUserId();
    await fetch(`/novels/${novelId}/sources/${sourceId}/chapter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, chapter: val })
    });
    this.progressMap.valueHasMutated?.();
  }
  async loadProgressAll() {
    const userId = this.getUserId();
    for (const novel of this.novelsArray()) {
      for (const src of (novel.sources || [])) {
        const resp = await fetch(`/novels/${novel.id}/sources/${src.id}/chapter?userId=${encodeURIComponent(userId)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.chapter !== undefined) {
            this.progressMap.valueWillMutate?.();
            this.progressMap()[src.id] = data.chapter;
            this.progressMap.valueHasMutated?.();
          }
        }
      }
    }
  }
  getUserId(): string {
    let userId = localStorage.getItem("uiUserId");
    if (!userId) {
      userId = String(Math.floor(Math.random() * 1e9));
      localStorage.setItem("uiUserId", userId);
    }
    return userId;
  }

  editNovel(novel: Novel) { alert("Edit Novel not yet implemented."); }
  editSource(source: Source) { alert("Edit Source not yet implemented."); }
}

export = NovelsViewModel;