import dotenv from "dotenv";
import axios from "axios";
import puppeteer from "puppeteer";

dotenv.config();

async function getAuthenticationCookies({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: "./user-data",
  });
  const page = await browser.newPage();
  await page.goto("https://qacademico.ifce.edu.br/qacademico/alunos");
  await page.type("#txtLogin", username);
  await page.type("#txtSenha", password);
  await page.click("#btnOk");
  await page.waitForNavigation();
  const cookies = await page.cookies();
  await browser.close();
  return cookies;
}

(async () => {
  const cookies = await getAuthenticationCookies({
    username: process.env.LOGIN || "",
    password: process.env.PASSWORD || "",
  });

  const parsedCookies = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  //console.log(await getDiarios(parsedCookies));
  //console.log(await getDocumentosSolicitados(parsedCookies));
  console.log(await getModelosDeDocumentos(parsedCookies));
})();

async function getDiarios(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/diarios/aluno/diarios",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

async function getDocumentosSolicitados(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/solicitacoes-realizadas",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

async function getModelosDeDocumentos(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/modelos-de-documentos",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

interface SolicitacaoDocumentoProps {
  cookies: string;
  anoLetivo: number;
  idModelo: number;
  periodoLetivo: number;
  requerPersonalizacao: number;
}

interface SolicitacaoDocumentoResponse {
  informacoesArquivo: {
    id: string;
    nome: string;
  };
  solicitacaoRealizada: {
    id: string;
    nome: string;
    dataDeSolicitacao: string;
    situacao: number;
    dataLimiteDeLiberacao: string | null;
    anoLetivo: string | null;
    periodoLetivo: string | null;
    diasParaLiberacao: number | null;
  };
}

async function getSolicitacaoDeDocumento({
  cookies,
  anoLetivo,
  idModelo,
  periodoLetivo,
  requerPersonalizacao,
}: SolicitacaoDocumentoProps) {
  const response = await axios.post(
    `https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/modelos-de-documentos/${idModelo}/solicitacao`,
    {
      anoLetivo: anoLetivo,
      idModelo: idModelo,
      periodoLetivo: periodoLetivo,
      requerPersonalizacao: requerPersonalizacao,
    },
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data as SolicitacaoDocumentoResponse;
}
