CREATE MATERIALIZED VIEW environment.rivers_up_cells AS
  SELECT
      gid,
      geom,
      ln(up_cells) as width
    FROM environment.rivers;
