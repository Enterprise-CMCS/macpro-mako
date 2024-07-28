import { type PackageActionWriteService } from "./../../lib/lambda/package-actions/services/package-action-write-service";

declare global {
  // eslint-disable-next-line no-var
  var packageActionWriteService: PackageActionWriteService;
}
