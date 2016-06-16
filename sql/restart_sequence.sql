ALTER SEQUENCE leylines.poi_site_id_seq RESTART;
UPDATE leylines.poi SET site_id = DEFAULT;
