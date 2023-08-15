export function s3ParseUrl(url: string) {
  const _decodedUrl = decodeURIComponent(url);

  // http://s3.amazonaws.com/bucket/key1/key2
  const _match_1 = _decodedUrl.match(
    /^https?:\/\/s3.amazonaws.com\/([^\/]+)\/?(.*?)$/
  );
  if (_match_1) {
    return {
      bucket: _match_1[1],
      key: _match_1[2],
      region: "",
    };
  }

  // http://s3-aws-region.amazonaws.com/bucket/key1/key2
  const _match_2 = _decodedUrl.match(
    /^https?:\/\/s3-([^.]+).amazonaws.com\/([^\/]+)\/?(.*?)$/
  );
  if (_match_2) {
    return {
      bucket: _match_2[2],
      key: _match_2[3],
      region: _match_2[1],
    };
  }

  // http://bucket.s3.amazonaws.com/key1/key2
  const _match_3 = _decodedUrl.match(
    /^https?:\/\/([^.]+).s3.amazonaws.com\/?(.*?)$/
  );
  if (_match_3) {
    return {
      bucket: _match_3[1],
      key: _match_3[2],
      region: "",
    };
  }

  // http://bucket.s3-aws-region.amazonaws.com/key1/key2 or,
  // http://bucket.s3.aws-region.amazonaws.com/key1/key2
  const _match_4 = _decodedUrl.match(
    /^https?:\/\/([^.]+).(?:s3-|s3\.)([^.]+).amazonaws.com\/?(.*?)$/
  );
  if (_match_4) {
    return {
      bucket: _match_4[1],
      key: _match_4[3],
      region: _match_4[2],
    };
  }

  return null;
}
