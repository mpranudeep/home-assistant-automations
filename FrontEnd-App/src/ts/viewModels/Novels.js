var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "knockout", "ojs/ojarraydataprovider"], function (require, exports, ko, ArrayDataProvider) {
    "use strict";
    class NovelsViewModel {
        constructor() {
            this.novelsArray = ko.observableArray([]);
            this.novels = new ArrayDataProvider(this.novelsArray, { keyAttributes: "id" });
            this.newNovelName = ko.observable("");
            this.newSourceName = ko.observable("");
            this.newSourceFlags = ko.observableArray([]);
            this.progressMap = ko.observable({});
            this.fetchNovels();
        }
        fetchNovels() {
            return __awaiter(this, void 0, void 0, function* () {
                const resp = yield fetch("/novels");
                if (resp.ok) {
                    const data = yield resp.json();
                    this.novelsArray(data);
                    yield this.loadProgressAll();
                }
            });
        }
        addNovel(event) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = event.preventDefault) === null || _a === void 0 ? void 0 : _a.call(event);
                if (!this.newNovelName())
                    return;
                const resp = yield fetch("/novels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: this.newNovelName() })
                });
                if (resp.ok) {
                    this.newNovelName("");
                    yield this.fetchNovels();
                }
            });
        }
        deleteNovel(novel) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!novel.id)
                    return;
                yield fetch(`/novels/${novel.id}`, { method: "DELETE" });
                yield this.fetchNovels();
            });
        }
        addSource(novel, event) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = event.preventDefault) === null || _a === void 0 ? void 0 : _a.call(event);
                if (!this.newSourceName())
                    return;
                const payload = {
                    name: this.newSourceName(),
                    translateEnabled: this.newSourceFlags().includes("translate"),
                    refinementEnabled: this.newSourceFlags().includes("refine")
                };
                yield fetch(`/novels/${novel.id}/sources`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                this.newSourceName("");
                this.newSourceFlags([]);
                yield this.fetchNovels();
            });
        }
        deleteSource(novel, source) {
            return __awaiter(this, void 0, void 0, function* () {
                yield fetch(`/novels/${novel.id}/sources/${source.id}`, { method: "DELETE" });
                yield this.fetchNovels();
            });
        }
        getProgress(source) {
            return this.progressMap()[source.id] || "";
        }
        setProgress(novelId, sourceId, val) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const userId = this.getUserId();
                yield fetch(`/novels/${novelId}/sources/${sourceId}/chapter`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, chapter: val })
                });
                (_b = (_a = this.progressMap).valueHasMutated) === null || _b === void 0 ? void 0 : _b.call(_a);
            });
        }
        loadProgressAll() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const userId = this.getUserId();
                for (const novel of this.novelsArray()) {
                    for (const src of (novel.sources || [])) {
                        const resp = yield fetch(`/novels/${novel.id}/sources/${src.id}/chapter?userId=${encodeURIComponent(userId)}`);
                        if (resp.ok) {
                            const data = yield resp.json();
                            if (data.chapter !== undefined) {
                                (_b = (_a = this.progressMap).valueWillMutate) === null || _b === void 0 ? void 0 : _b.call(_a);
                                this.progressMap()[src.id] = data.chapter;
                                (_d = (_c = this.progressMap).valueHasMutated) === null || _d === void 0 ? void 0 : _d.call(_c);
                            }
                        }
                    }
                }
            });
        }
        getUserId() {
            let userId = localStorage.getItem("uiUserId");
            if (!userId) {
                userId = String(Math.floor(Math.random() * 1e9));
                localStorage.setItem("uiUserId", userId);
            }
            return userId;
        }
        editNovel(novel) { alert("Edit Novel not yet implemented."); }
        editSource(source) { alert("Edit Source not yet implemented."); }
    }
    return NovelsViewModel;
});
