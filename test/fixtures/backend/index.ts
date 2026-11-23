import { createBackendHandlers } from "./handlers";
import { BackendStore, type SeedPackageOptions } from "./store";

export type BackendFixture = {
  store: BackendStore;
  handlers: ReturnType<typeof createBackendHandlers>;
  seedPackage: (options?: SeedPackageOptions) => ReturnType<BackendStore["seedPackage"]>;
  get: BackendStore["get"];
  list: BackendStore["list"];
  upsertFromSubmit: BackendStore["upsertFromSubmit"];
  nextArchiveStatus: BackendStore["nextArchiveStatus"];
  attachmentDownloadUrl: BackendStore["attachmentDownloadUrl"];
  fileBytesForUrl: BackendStore["fileBytesForUrl"];
};

export function createBackend(): BackendFixture {
  const store = new BackendStore();
  const handlers = createBackendHandlers(store);

  return {
    store,
    handlers,
    seedPackage: (options?: SeedPackageOptions) => store.seedPackage(options),
    get: (id) => store.get(id),
    list: (authorityFilter, search) => store.list(authorityFilter, search),
    upsertFromSubmit: (body) => store.upsertFromSubmit(body),
    nextArchiveStatus: (id, scope, sectionId) => store.nextArchiveStatus(id, scope, sectionId),
    attachmentDownloadUrl: (id, bucket, key, filename) =>
      store.attachmentDownloadUrl(id, bucket, key, filename),
    fileBytesForUrl: (url) => store.fileBytesForUrl(url),
  };
}

export type { SeedPackageOptions };
export { BackendStore };
