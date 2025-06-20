import { Router } from "express";
import { FuentesRoutes } from "./fuentes/fuentes.routes";
import { CategoriasRoutes } from "./categorias/categorias.routes";
import { ScraperGeneralRoutes } from "./scraper-general/scraper-general.routes";
import { UsuarioRoutes } from "./usuario/usuario.routes";
import { PacienteRoutes } from "./paciente/paciente.routes";
import { ReferenciaSignosVRoutes } from "./referencia-signosV/referencias-signosv.routes";
import { SignosVitalesRoutes } from "./signos-vitales/signos-vitales.routes";
import { EjercicioPacienteRoutes } from "./ejercicio-paciente/ejercicio-paciente.routes";
import { EjercicioGeneradoRoutes } from "./ejercicio-generado/ejercicio-generado.routes";
import { EjercicioResultadosRoutes } from "./ejercicio-resultado/ejercicio-resultado.routes";
import { CentroRoutes } from "./centro-gerontologico/centro-gerontologico.routes";
import { CuidadorRoutes } from "./cuidador/cuidador.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/fuentes", FuentesRoutes.routes);
    router.use("/categorias", CategoriasRoutes.routes);
    router.use("/ejercicio", ScraperGeneralRoutes.routes);
    router.use("/usuario", UsuarioRoutes.routes);
    router.use("/paciente", PacienteRoutes.routes);
    router.use("/referencia", ReferenciaSignosVRoutes.routes);
    router.use("/signosV", SignosVitalesRoutes.routes);
    router.use("/ejercicioP", EjercicioPacienteRoutes.routes);
    router.use("/GenerateEjercicio", EjercicioGeneradoRoutes.routes);
    router.use("/ejercicioResultado", EjercicioResultadosRoutes.routes);
    router.use("/centro", CentroRoutes.routes);
    router.use("/cuidador", CuidadorRoutes.routes);
    return router;
  }
}
