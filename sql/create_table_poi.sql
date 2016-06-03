SET @schemaName = 'poi';
SET @tableName = 'test';
SET @objectType = 4;

SET @pkey =  @tableName + '_pkey';
SET @gix = @tableName + '_gix';

CREATE TABLE @schemaName.@tableName
(
  gid serial NOT NULL,
  site text,
  description text,
  object_type integer references object_types(id) DEFAULT @objectType,
  object_sub_type integer references object_sub_types(id) DEFAULT 1,
  bovis_units integer DEFAULT 0,
  data_owner text,
  links text,
  importance integer references object_importance(id) DEFAULT 1,
  x_coord double precision,
  y_coord double precision,
  z_coord double precision,
  geom geometry(PointZ,4326),
  date_creation timestamp without time zone,
  date_modification timestamp without time zone,
  country text,
  CONSTRAINT @pkey PRIMARY KEY (gid)
)
WITH (
  OIDS=FALSE
);

ALTER TABLE @schemaName.@tableName
  OWNER TO postgres;
GRANT SELECT ON TABLE @schemaName.@tableName TO public;
GRANT ALL ON TABLE @schemaName.@tableName TO postgres;

CREATE INDEX @gix
  ON @schemaName.@tableName
  USING gist
  (geom);

CREATE TRIGGER "05_trigger_get_coords"
  BEFORE INSERT OR UPDATE
  ON @schemaName.@tableName
  FOR EACH ROW
  EXECUTE PROCEDURE get_coords();

CREATE TRIGGER "10_trigger_update_geom"
  BEFORE INSERT OR UPDATE
  ON @schemaName.@tableName
  FOR EACH ROW
  EXECUTE PROCEDURE update_point_geom();

CREATE TRIGGER "20_trigger_get_country"
  BEFORE INSERT OR UPDATE
  ON @schemaName.@tableName
  FOR EACH ROW
  EXECUTE PROCEDURE get_country();

